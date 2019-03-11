const express = require('express');
const router = express.Router();
const passport = require('passport');
//Load Post Model
const Post = require('../../models/post');
//Load Profile Model
const Profile = require('../../models/profile');

//Validation
const validatePostInput = require('../../validations/post');

// @route testing for post
// /api/post/test
//@get request with public access
router.get('/test', (req, res) => res.status(200).json({msg: 'this is post'}));

//@route GET api/posts
//@desc See Posts
//@access public
router.get('/', (req, res) => {
  Post.find()
  .sort({date: -1})
  .then(posts => res.json(posts))
  .catch(err => res.status(404).json({Noposts: 'No Posts Found'}));
})

//@route GET api/posts
//@desc See Post by id
//@access public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
  .then(post => res.json(post))
  .catch(err => res.status(404).json({nopost: 'No Post Found with that ID'}));
})

//@route POST api/posts
//@desc Create Posts
//@access private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  })
  newPost.save()
  .then(post => {

    res.json(post)
  })
  .catch(err => res.json(err));
})

//@route Delete api/posts/:id
//@desc Delete Posts
//@access private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({user: req.user.id})
  .then(profile => {
    Post.findById(req.params.id)
    .then(post => {
      //Check for Authorization
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({unauthorized: 'Unauthorized access'});
      }
      //Delete Post
      post.remove().then(() => res.status(200).json({success: true}))
    })
    .catch(err => res.status(404).json({postnotfound: 'No such post exists'}))
  })
})

//@route POST api/posts/like/:id
//@desc Like Posts
//@access private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({user: req.user.id})
  .then(profile => {
    Post.findById(req.params.id)
    .then(post => {
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({alreadyliked: 'User already liked this post'});
    }
    post.likes.unshift({user: req.user.id});
    post.save().then(post => res.status(200).json(post));
    })
    .catch(err => res.status(404).json({postnotfound: 'No such post exists'}))
  })
})

//@route POST api/posts/like/:id
//@desc Like Posts
//@access private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this post' });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

//@route POST api/posts/comment/:id
//@desc  Make a comment
//@access private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
  .then(post => {
    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    }

    //Adding comment to array
    post.comments.unshift(newComment);
    //save
    post.save()
    .then(post => res.json(post));
  })
  .catch(err => res.status(404).json({nopost: 'No post found'}))
})


// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);
module.exports = router;

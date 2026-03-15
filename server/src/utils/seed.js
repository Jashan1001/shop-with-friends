require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Room = require('../models/Room')
const Product = require('../models/Product')
const Vote = require('../models/Vote')
const Comment = require('../models/Comment')

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  // Clean existing demo data
  await User.deleteMany({ email: { $in: ['demo1@cartcrew.app', 'demo2@cartcrew.app'] } })
  await Room.deleteMany({ name: 'Demo Room — Laptops' })
  console.log('Cleaned existing demo data')

  // Create two demo users
  const user1 = await User.create({
    name: 'Demo User One',
    username: 'demo_one',
    email: 'demo1@cartcrew.app',
    password: 'Demo1234',
  })

  const user2 = await User.create({
    name: 'Demo User Two',
    username: 'demo_two',
    email: 'demo2@cartcrew.app',
    password: 'Demo1234',
  })

  console.log('Created demo users')

  // Create a demo room
  const room = await Room.create({
    name: 'Demo Room — Laptops',
    description: 'Finding the best laptop under 80k',
    emoji: 'laptop',
    createdBy: user1._id,
    members: [user1._id, user2._id],
    inviteCode: 'DEMO1234',
  })

  // Add room to both users
  await User.findByIdAndUpdate(user1._id, { $push: { rooms: room._id } })
  await User.findByIdAndUpdate(user2._id, { $push: { rooms: room._id } })

  console.log('Created demo room')

  // Create demo products
  const products = await Product.insertMany([
    {
      roomId: room._id,
      addedBy: user1._id,
      title: 'MacBook Air M2',
      price: 114900,
      currency: 'INR',
      platform: 'amazon',
      description: 'Best battery life, great for dev work',
      status: 'active',
    },
    {
      roomId: room._id,
      addedBy: user2._id,
      title: 'Dell XPS 13',
      price: 109990,
      currency: 'INR',
      platform: 'amazon',
      description: 'Compact, powerful, great display',
      status: 'active',
    },
    {
      roomId: room._id,
      addedBy: user1._id,
      title: 'Lenovo ThinkPad X1 Carbon',
      price: 124999,
      currency: 'INR',
      platform: 'flipkart',
      description: 'Best keyboard, enterprise grade',
      status: 'active',
    },
    {
      roomId: room._id,
      addedBy: user2._id,
      title: 'ASUS ZenBook 14',
      price: 74990,
      currency: 'INR',
      platform: 'amazon',
      description: 'Budget friendly, good build quality',
      status: 'skipped',
    },
    {
      roomId: room._id,
      addedBy: user1._id,
      title: 'HP Spectre x360',
      price: 139990,
      currency: 'INR',
      platform: 'other',
      description: '2-in-1 convertible, premium build',
      status: 'active',
    },
  ])

  console.log('Created demo products')

  // Add votes
  await Vote.insertMany([
    { productId: products[0]._id, userId: user1._id, roomId: room._id, value: 1 },
    { productId: products[0]._id, userId: user2._id, roomId: room._id, value: 1 },
    { productId: products[1]._id, userId: user1._id, roomId: room._id, value: 1 },
    { productId: products[1]._id, userId: user2._id, roomId: room._id, value: -1 },
    { productId: products[2]._id, userId: user2._id, roomId: room._id, value: 1 },
    { productId: products[4]._id, userId: user1._id, roomId: room._id, value: -1 },
  ])

  console.log('Added votes')

  // Add a comment
  await Comment.create({
    productId: products[0]._id,
    roomId: room._id,
    userId: user2._id,
    text: 'The M2 battery life is insane, easily 15+ hours',
  })

  console.log('Added comments')

  console.log('\n✓ Seed complete')
  console.log('Demo account 1: demo1@cartcrew.app / Demo1234')
  console.log('Demo account 2: demo2@cartcrew.app / Demo1234')
  console.log('Room invite code: DEMO1234')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})

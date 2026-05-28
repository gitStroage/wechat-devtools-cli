import { formatDate } from '../../utils/date'
const config = require('../../config')

Page({
  data: {
    title: '首页',
  },
  onLoad() {
    console.log('Page loaded')
  },
  onTap() {
    wx.showToast({ title: 'Clicked' })
  },
})

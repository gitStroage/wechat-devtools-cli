Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
  },
  methods: {
    onBack() {
      wx.navigateBack()
    },
  },
})

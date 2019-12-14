const app = getApp();
Component({
  data: {},
  properties: {
    propData: Array
  },
  methods: {
    navigation_event(e) {
      console.log(e)
      app.operation_event(e);
    },
  },
});

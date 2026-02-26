class HistoryBuffer {
    constructor(limit = 60) {
      this.limit = limit;
      this.data = [];
    }
  
    add(point) {
      this.data.push(point);
      if (this.data.length > this.limit) {
        this.data.shift();
      }
    }
  
    get() {
      return this.data;
    }
  }
  
  module.exports = HistoryBuffer;
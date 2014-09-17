
var Test = function() {
	this.a = 'a'
	this.b = function() {
		this.b1 = 'test';
	};
};

var test = new Test;

console.log(test);

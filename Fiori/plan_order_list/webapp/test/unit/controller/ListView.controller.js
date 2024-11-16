/*global QUnit*/

sap.ui.define([
	"cl3syncyoungppporder/plan_order_list/controller/ListView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ListView Controller");

	QUnit.test("I should test the ListView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

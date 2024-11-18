/*global QUnit*/

sap.ui.define([
	"cl3syncyoungpppureq/pur_req_approval/controller/ApprovalView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ApprovalView Controller");

	QUnit.test("I should test the ApprovalView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

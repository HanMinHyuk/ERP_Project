/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"cl3syncyoungppporder/plan_order_list/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});

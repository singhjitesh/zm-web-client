/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty ZmDialog.
* @constructor
* @class
* This class is a base class for miscellaneous organizer-related dialogs.
*
* @author Conrad Damon
* @param parent			[DwtControl]	parent widget
* @param msgDialog		[DwtMsgDialog]*	message dialog
* @param className		[string]*		CSS class
* @param title			[string]*		dialog title
* @param extraButtons	[Array]*		buttons to show in addition to standard set
* @param view			[DwtControl]*	dialog contents
*/
function ZmDialog(parent, msgDialog, className, title, extraButtons, view) {

	if (arguments.length == 0) return;
	DwtDialog.call(this, parent, className, title, null, extraButtons);
	DBG.timePt(AjxDebug.PERF, "DwtDialog constructor");
	if (!view) {
		this.setContent(this._contentHtml());
		DBG.timePt(AjxDebug.PERF, "setContent(_contentHtml())");
	} else {
		this.setView(view);
	}

	this._msgDialog = msgDialog;
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	if (this._msgDialog == null) {
		this._msgDialog = this._appCtxt.getMsgDialog();
	}
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	
	this._treeView = new Object();
	this._opc = this._appCtxt.getOverviewController();
	DBG.timePt(AjxDebug.PERF, "ZmDialog constructor");
}

ZmDialog.prototype = new DwtDialog;
ZmDialog.prototype.constructor = ZmDialog;

ZmDialog.prototype._contentHtml = function () {return "";};
ZmDialog.prototype._okButtonListener = function () {};

ZmDialog.prototype.setView =
function(newView, noReset) {
	this.reset();
	if (newView) {
		var el = newView.getHtmlElement();
		var td = this._contentDiv.parentNode;
		td.replaceChild(el, this._contentDiv);
		this._contentDiv = el;
	}
};

ZmDialog.prototype.popup =
function(data, loc) {
	var showTiming = DBG.isShowTiming();
	if (!showTiming) DBG.showTiming(true, AjxDebug.PERF, "ZmDialog#popup");
	DwtDialog.prototype.popup.call(this, loc);
	DBG.timePt(AjxDebug.PERF, "ZmDialog popup");
	if (!showTiming) DBG.showTiming(false);
}

ZmDialog.prototype.reset =
function() {
	if (this._nameField)
		this._nameField.value = "";
	DwtDialog.prototype.reset.call(this);
}

ZmDialog.prototype._setNameField =
function(fieldId) {
	this._nameField = document.getElementById(fieldId);
	if (this._nameField) this._focusElementId = fieldId;
	this.setTabOrder([fieldId]);
	this.addEnterListener(new AjxListener(this, this._enterListener));
}

ZmDialog.prototype._setOverview =
function(overviewId, fieldId, treeIds, omit) {
	this._createOverview(overviewId, fieldId);
	this._renderOverview(overviewId, treeIds, omit);
}

ZmDialog.prototype._createOverview =
function(overviewId, fieldId) {
	var overview = this._opc.createOverview({overviewId: overviewId, overviewClass: "dialogOverview",
											 headerClass: "DwtTreeItem"});
	document.getElementById(fieldId).appendChild(overview.getHtmlElement());
}

ZmDialog.prototype._renderOverview =
function(overviewId, treeIds, omit) {
	this._opc.set(overviewId, treeIds, omit);
	for (var i = 0; i < treeIds.length; i++) {
		var treeView = this._treeView[treeIds[i]] = this._opc.getTreeView(overviewId, treeIds[i]);
		var hi = treeView.getHeaderItem();
		hi.enableSelection(true);
	}
}

ZmDialog.prototype._getInputFields = 
function() {
	if (this._nameField)
		return [this._nameField];
}

ZmDialog.prototype._showError =
function(msg, loc) {
	this._msgDialog.reset();
	loc = loc ? loc : new DwtPoint(this.getLocation().x + 50, this.getLocation().y + 100);
    this._msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
    this._msgDialog.popup(loc);
    return null;
}

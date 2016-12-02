"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const path = require("path");

const IconNode = require("../service/icon-node.js");
const Resource = require("../filesystem/resource.js");


class ArchiveEntry extends Resource {
	
	constructor(view, entry, archivePath, isDirectory = false){
		super(path.join(archivePath, entry.path));
		this.view        = view;
		this.entry       = entry;
		this.archivePath = archivePath;
		this.isDirectory = isDirectory;
		
		const iconElement = isDirectory
			? view[0].querySelector(".directory.icon")
			: view[0].spacePenView.name[0];
		
		this.iconNode = new IconNode(this, iconElement);
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.iconNode.destroy();
			super.destroy();
			this.iconNode = null;
			this.element = null;
			this.source = null;
		}
	}
	
	
	linkPaneItem(view){
		if(!this.paneItem && view){
			this.paneItem = view;
			
			if("function" === typeof view.onDidDestroy)
				this.disposables.add(view.onDidDestroy(_=> this.destroy()));
		}
	}
}


module.exports = ArchiveEntry;
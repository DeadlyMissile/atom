"use strict";

const {CompositeDisposable} = require("atom");
const IconService = require("./icon-service.js");
const Options = require("../options.js");
const UI = require("../ui.js");


class IconNode{
	
	constructor(resource, element){
		const delegate = IconService.getDelegate(resource);
		this.disposables = new CompositeDisposable();
		this.resource = resource;
		this.delegate = delegate;
		this.element = element;
		this.visible = true;
		this.classes = null;
		this.appliedClasses = delegate.appliedClasses || null;
		
		this.disposables.add(
			UI.onMotifChanged(_=> IconService.ready && this.refresh()),
			Options.onDidChange("coloured", _=> this.refresh()),
			Options.onDidChange("colourChangedOnly", _=> this.refresh()),
			delegate.onDidChangeIcon(_=> this.refresh()),
			resource.onDidDestroy(_=> this.destroy()),
			resource.onDidChangeVCSStatus(_=> {
				if(Options.colourChangedOnly)
					this.refresh();
			})
		);
		
		if(!resource.isDirectory)
			this.disposables.add(
				Options.onDidChange("defaultIconClass", _=> this.refresh())
			);
		
		else if(delegate.getIcon())
			this.element.classList.remove("icon-file-directory");
		
		IconService.ready
			? this.refresh()
			: setImmediate(_=> this.refresh());
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.disposables.dispose();
			this.resource  = null;
			this.element   = null;
			this.delegate  = null;
			this.destroyed = true;
		}
	}
	
	
	refresh(){
		const classes = this.delegate.getClasses();
		if(this.classesDiffer(classes, this.classes)){
			this.removeClasses();
			this.classes = classes;
			this.addClasses();
		}
	}
	
	
	setVisible(input){
		input = !!input;
		if(input !== this.visible){
			this.visible = input;
			this.refresh();
		}
	}
	
	
	/**
	 * Apply the current icon-classes to the instance's element.
	 *
	 * @private
	 */
	addClasses(){
		if(!this.visible) return;
		
		if(this.classes){
			this.appliedClasses = this.classes;
			this.element.classList.add(...this.appliedClasses);
		}
	}
	
	
	/**
	 * Remove previously-applied classes.
	 *
	 * @private
	 */
	removeClasses(){
		if(null !== this.appliedClasses){
			this.element.classList.remove(...this.appliedClasses);
			this.appliedClasses = null;
		}
	}
	
	
	/**
	 * Determine if two icon-class lists differ.
	 *
	 * @param {Array} a
	 * @param {Array} b
	 * @return {Boolean}
	 * @private
	 */
	classesDiffer(a, b){
		return (a && b)
			? !(a[0] === b[0] && a[1] === b[1])
			: true;
	}
}


module.exports = IconNode;
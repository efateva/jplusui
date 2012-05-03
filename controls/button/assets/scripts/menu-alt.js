/** * @author  */imports("Controls.Button.Menu-Alt");using("System.Dom.Align");using("Controls.Core.ContentControl");using("Controls.Core.ListControl");var MenuItem = ContentControl.extend({		xType: 'menuitem',		tpl: '<a class="x-menuitem"><span class="x-icon x-icon-none"></span></a>',		subMenu: null,		/**	 * 	 */	init: function(){		this.base('init');		this.unselectable();		this.on('mouseover', this.onMouseEnter);		this.on('mouseout', this.onMouseLeave);				var subMenu = this.find('.x-menu');		if(subMenu){			this.setSubMenu(new Menu(subMenu));		}	},		setSubMenu: function(menu){		if (menu) {			this.subMenu = menu.hide();			menu.floating = false;			this.addClass('x-menuitem-menu');			this.on('mouseup', this._cancelHideMenu);		} else {			menu.floating = true;			this.removeClass('x-menuitem-menu');			this.un('mouseup', this._cancelHideMenu);		}	},		_cancelHideMenu: function(e){		e.stopPropagation();	},		toggleIcon: function(icon, val){		this.icon.toggleClass(icon, val);		return this;	},		onMouseEnter: function(){				// 使用父菜单打开本菜单，显示子菜单。		this.parentControl && this.parentControl.showSub(this);	},		_hideTargetMenu: function(e){		var tg = e.relatedTarget;		while(tg && tg.className != 'x-menu') {			tg = tg.parentNode;		}				if (tg) {   			var dt = System.data(tg, 'menu');									tg.hideSub();		}			},		onMouseLeave: function(e){				// 没子菜单，需要自取消激活。		// 否则，由父菜单取消当前菜单的状态。		// 因为如果有子菜单，必须在子菜单关闭后才能关闭激活。				if(!this.subMenu)			 this.setSelected(false);			 	},		setSelected: function(value){		this.getParent().toggleClass('x-menuitem-selected', value);		this.toggleClass('x-menuitem-selected', value);		return this;	},		getSelected: function(){		return this.hasClass('x-menuitem x-menuitem-selected');	},		setChecked: function(value){		this.find('.x-icon').dom.className = 'x-icon x-icon-' + (value === false ? 'unchecked' : value !== null ? 'checked' : 'none');		return this;	},		getChecked: function(){		return this.hasClass('x-menuitem x-menuitem-checked');	},		setDisabled: function(value){		this.getParent().toggleClass('x-menuitem-disabled', value);		this.toggleClass('x-menuitem-disabled', value);		return this;	},		getDisabled: function(){		return this.hasClass('x-menuitem x-menuitem-disabled');	}});var MenuSeperator = Control.extend({		tpl: '<div class="x-menu-seperator"></div>',		init: Function.empty	});var Menu = ListControl.extend({		xType: 'menu',		initChild: function (item) {		if(item instanceof MenuItem || item instanceof MenuSeperator){			return item;		}		if(item === '-'){			return new 	MenuSeperator();		}				if(item instanceof Control && item.hasClass('x-menuitem')){			return new MenuItem(item);		}				var menu = new MenuItem();		menu.append(item);		return menu;	},		init: function(){		var me = this;		me.base('init');				// 绑定节点和控件，方便发生事件后，根据事件源得到控件。		System.setData(this.dom, 'menu', this);	},		showMenu: function(){		this.show();		this.onShow();	},		hideMenu: function(){		this.hide();		this.onHide();	},		/**	 * 当前菜单依靠某个控件显示。	 * @param {Control} ctrl 方向。	 */	showAt: function(x, y){				if(!this.getParent('body')){			this.appendTo();		}				// 显示节点。		this.showMenu();				this.setPosition(x, y);				return this;	},		/**	 * 当前菜单依靠某个控件显示。	 * @param {Control} ctrl 方向。	 */	showBy: function(ctrl, pos, offsetX, offsetY, enableReset){				if(!this.getParent('body')){			this.appendTo(ctrl.getParent());		}				// 显示节点。		this.showMenu();				this.align(ctrl, pos || 'rt', offsetX != null ? offsetX : -5, offsetY != null ? offsetY : -5, enableReset);				return this;	},		onShow: function(){		this.floating = true;		document.once('mouseup', this.hideMenu, this);		this.trigger('show');	},		/**	 * 关闭本菜单。	 */	onHide: function(){				// 先关闭子菜单。		this.hideSub();		this.trigger('hide');	},		/**	 * 打开本菜单子菜单。	 * @protected	 */	showSub: function(item){				// 如果不是右键的菜单，在打开子菜单后监听点击，并关闭此子菜单。		if(!this.floating)			document.once('mouseup', this.hideSub, this);				// 隐藏当前项子菜单。		this.hideSub();				// 激活本项。		item.setSelected(true);				if (item.subMenu) {						// 设置当前激活的项。			this.currentSubMenu = item;						// 显示子菜单。			item.subMenu.showBy(item);					}	},		/**	 * 关闭本菜单打开的子菜单。	 * @protected	 */	hideSub: function(){				// 如果有子菜单，就隐藏。		if(this.currentSubMenu) {						// 关闭子菜单。			this.currentSubMenu.subMenu.hide();						// 取消激活菜单。			this.currentSubMenu.setSelected(false);			this.currentSubMenu = null;		}	}	});
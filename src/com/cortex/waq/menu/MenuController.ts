import ListComponent from "../../core/component/ListComponent";

import MouseTouchEvent from "../../core/mouse/event/MouseTouchEvent";

import MVCEvent from "../../core/mvc/event/MVCEvent";
import EventDispatcher from "../../core/event/EventDispatcher";
import AbstractView from "../../core/mvc/AbstractView";

import NavigationEvent from "../../core/navigation/event/NavigationEvent";
import NavigationManager from "../../core/navigation/NavigationManager";

import MenuItem from "./data/MenuItem";
import MenuEvent from "./event/MenuEvent";
import MenuItemModel from "./MenuItemModel";

import ContactController from "../contact/ContactController";

import HomeController from "../home/HomeController";

import ProfileController from "../profile/ProfileController";

import ScheduleController from "../schedule/ScheduleController";

import TicketsController from "../tickets/TicketsController";

export default class MenuController extends EventDispatcher {
	
	private mMenuView:AbstractView;
	private mListComponent:ListComponent;
	// Dictionary of actions & their corresponding controllers
	private mControllers:{[controllerName: string]:any};
	
	constructor() {
		super();
		this.Init();
	}
	
	public Init():void {
		MenuItemModel.GetInstance();
		// MenuItemModel.addEvent
		
		// dans navigation C, init from main
		this.mControllers = {
			"": HomeController,
			"contact": ContactController,
			"tickets": TicketsController,
			"schedule": ScheduleController,
			"profile": ProfileController
		};
	}
	
	public Destroy():void {
		var menuHTMLElement:HTMLElement = document.getElementById("menuView");
		document.getElementById("overlay").removeChild(menuHTMLElement);
		
		this.mListComponent.Destroy();
		this.mListComponent = null;
		
		this.mMenuView.Destroy();
		this.mMenuView = null;
		
		super.Destroy();
	}
	
	private OnTemplateLoaded(aEvent:MVCEvent):void {
		document.getElementById("overlay").innerHTML += this.mMenuView.RenderTemplate({});
		this.mMenuView.RemoveEventListener(MVCEvent.TEMPLATE_LOADED, this.OnTemplateLoaded, this);
		
		this.mMenuView.AddClickControl(document.getElementById("menu-close"));
		this.mMenuView.AddEventListener(MouseTouchEvent.TOUCHED, this.OnScreenClicked, this);
		
		this.mListComponent = new ListComponent();
		this.mListComponent.Init("menu-menuItemContainer");
		
		this.GenerateMenuItems();
	}
	
	private GenerateMenuItems():void {
		var menuItems:Array<MenuItem> = MenuItemModel.GetInstance().GetMenuItems();
		menuItems.sort(function(a:MenuItem, b:MenuItem):number {
			if (a.order < b.order) return -1;
			if (a.order > b.order) return 1;
			return 0;
		});
		
		var max:number = menuItems.length;
		for (var i:number = 0; i < max; i++) {
			var menuItemView:AbstractView = new AbstractView();
			menuItemView.AddEventListener(MVCEvent.TEMPLATE_LOADED, this.OnMenuItemTemplateLoaded, this);
			this.mListComponent.AddComponent(menuItemView, "templates/menu/menuItem.html", menuItems[i]);
		}
	}
	
	private OnMenuItemTemplateLoaded(aEvent:MVCEvent):void {
		var menuItem:MenuItem = <MenuItem>this.mListComponent.GetDataByComponent(<AbstractView>aEvent.target);
		this.mMenuView.AddClickControl(document.getElementById("menu-menuItem" + menuItem.ID));
	}
	
	private OnScreenClicked(aEvent:MouseTouchEvent):void {
		var element:HTMLElement = <HTMLElement>aEvent.currentTarget;
		
		if (element.id == "menu-close") {
			this.OnMenuClose();
		}
		else if (element.id.indexOf("menu-menuItem") >= 0) {
			this.OnMenuItemClicked(element.id);
		}
	}
	
	private OnMenuClose():void {
		this.DispatchEvent(new MenuEvent(MenuEvent.CLOSE_MENU));
	}
	
	private OnMenuItemClicked(aElementId:string):void {
		var menuItemId:string = aElementId.split("menu-menuItem")[1];
		var menuItem:MenuItem = <MenuItem>this.mListComponent.GetDataByID(menuItemId);
		
		var controller:any = this.mControllers[menuItem.action];
		var event:NavigationEvent = new NavigationEvent(NavigationEvent.NAVIGATE_TO);
		event.setDestination(menuItem.action, controller);
		
		this.DispatchEvent(new MenuEvent(MenuEvent.CLOSE_MENU));
		this.DispatchEvent(event);
	}
}
import EventDispatcher from "../../core/event/EventDispatcher";

import MouseTouchEvent from "../../core/mouse/event/MouseTouchEvent";

import MVCEvent from "../../core/mvc/event/MVCEvent";
import AbstractView from "../../core/mvc/AbstractView";

import NavigationEvent from "../../core/navigation/event/NavigationEvent";
import NavigationManager from "../../core/navigation/NavigationManager";

import MenuEvent from "../menu/event/MenuEvent";
import MenuController from "../menu/MenuController";

export default class HeaderController extends EventDispatcher {

	private mHeaderView:AbstractView;
	private mMenuController:MenuController;
	
	constructor() {
		super();
		this.Init();
	}
	
	private Init():void {
		this.mHeaderView = new AbstractView();
		this.mHeaderView.AddEventListener(MVCEvent.TEMPLATE_LOADED, this.OnTemplateLoaded, this);
		this.mHeaderView.LoadTemplate("templates/header/header.html");
	}
	
	private OnTemplateLoaded(aEvent:MVCEvent):void {
		document.getElementById("header-view").innerHTML += this.mHeaderView.RenderTemplate({});
		this.mHeaderView.RemoveEventListener(MVCEvent.TEMPLATE_LOADED, this.OnTemplateLoaded, this);
		
		this.mHeaderView.AddClickControl(document.getElementById("open-menu"));
		this.mHeaderView.AddEventListener(MouseTouchEvent.TOUCHED, this.OnScreenClicked, this);
	}
	
	private OnScreenClicked(aEvent:MouseTouchEvent):void {
		var element:HTMLElement = <HTMLElement>aEvent.currentTarget;
		
		if (element.id == "open-menu") {
			this.OnMenuClicked();
		}
	}
	
	private OnMenuClicked():void {
		this.mMenuController = new MenuController();
		this.mMenuController.Init();
		this.mMenuController.AddEventListener(MenuEvent.CLOSE_MENU, this.OnMenuClose, this);
		this.mMenuController.AddEventListener(NavigationEvent.NAVIGATE_TO, this.OnNavigateTo, this);
		this.HideMenuButton();
	}
	
	private OnMenuClose():void {
		this.mMenuController.RemoveEventListener(MenuEvent.CLOSE_MENU, this.OnMenuClose, this);
		this.mMenuController.RemoveEventListener(NavigationEvent.NAVIGATE_TO, this.OnNavigateTo, this);
		this.mMenuController.Destroy();
		this.ShowMenuButton();
	}
	
	private OnNavigateTo(ev:NavigationEvent):void {
		this.DispatchEvent(ev);
	}
	
	private HideMenuButton():void {
		var menu:HTMLElement = document.getElementById("headerView");
		menu.className = "hidden";
	}
	
	private ShowMenuButton():void {
		var menu:HTMLElement = document.getElementById("headerView");
		menu.className = "";
	}
	
}
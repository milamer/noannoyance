import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";

export default class StealMyFocus extends Extension {
  constructor() {
    super();
    this._windowDemandsAttentionId = global.display.connect(
      "window-demands-attention",
      this._onWindowDemandsAttention.bind(this)
    );
    this._windowMarkedUrgentId = global.display.connect(
      "window-marked-urgent",
      this._onWindowDemandsAttention.bind(this)
    );

    console.log("Disabling 'Window Is Ready' Notification");
  }

  _onWindowDemandsAttention(display, window) {
    if (!window || window.has_focus() || window.is_skip_taskbar()) return;

    let settings = this.getSettings();
    let preventDisable = settings.get_boolean("enable-ignorelist");
    let byClassList = settings.get_strv("by-class");

    if (preventDisable) {
      if (byClassList.includes(window.get_wm_class())) {
        console.log(
          `Ignored "${window.get_wm_class()}"s Request to Steal Focus`
        );
        return;
      }
    }

    Main.activateWindow(window);
  }

  destroy() {
    global.display.disconnect(this._windowDemandsAttentionId);
    global.display.disconnect(this._windowMarkedUrgentId);
    console.log("Reenabling 'Window Is Ready' Notification");
  }

  enable() {
    this._settings = this.getSettings();
    console.log(_("This is a translatable text"));

    global.display.disconnect(
      Main.windowAttentionHandler._windowDemandsAttentionId
    );
    global.display.disconnect(
      Main.windowAttentionHandler._windowMarkedUrgentId
    );
    this.oldHandler = Main.windowAttentionHandler;
    Main.windowAttentionHandler = this;
  }

  disable() {
    this.oldHandler._windowDemandsAttentionId = global.display.connect(
      "window-demands-attention",
      this.oldHandler._onWindowDemandsAttention.bind(this.oldHandler)
    );
    this.oldHandler._windowMarkedUrgentId = global.display.connect(
      "window-marked-urgent",
      this.oldHandler._onWindowDemandsAttention.bind(this.oldHandler)
    );

    Main.windowAttentionHandler = this.oldHandler;
  }
}

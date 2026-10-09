-- Hyprland Lua config (0.55+).
-- https://wiki.hypr.land/Configuring/Start/
-- LuaLS stubs: /usr/share/hypr/stubs


------------------
---- MONITORS ----
------------------

-- See https://wiki.hypr.land/Configuring/Basics/Monitors/
hl.monitor({
    output   = "HDMI-A-1",
    mode     = "3840x2160@120.00",
    position = "0x0",
    scale    = 1.25,
})

hl.monitor({
    output   = "HDMI-A-2",
    mode     = "3840x2160@120.00",
    position = "0x0",
    scale    = 1.25,
})


---------------------
---- MY PROGRAMS ----
---------------------

local terminal    = "ghostty"
-- local terminal = "alacritty"
local fileManager = "dolphin"
local menu        = "wofi --show drun"


-------------------------------
---- ENVIRONMENT VARIABLES ----
-------------------------------

-- See https://wiki.hypr.land/Configuring/Advanced-and-Cool/Environment-variables/

hl.env("XCURSOR_THEME", "catppuccin-mocha-pink-cursors")
hl.env("XCURSOR_SIZE", "32")
hl.env("HYPRCURSOR_SIZE", "32")

-- hl.env("KITTY_ENABLE_WAYLAND", "1")
hl.env("GDK_BACKEND", "wayland,x11")
hl.env("SDL_VIDEODRIVER", "wayland")
hl.env("CLUTTER_BACKEND", "wayland")
hl.env("XDG_CURRENT_DESKTOP", "Hyprland")
hl.env("XDG_SESSION_TYPE", "wayland")
hl.env("XDG_SESSION_DESKTOP", "Hyprland")
-- hl.env("WAYLAND_DISPLAY", "wayland-1")
hl.env("WLR_RENDERER_ALLOW_SOFTWARE", "1")
hl.env("WLR_NO_HARDWARE_CURSORS", "1")
hl.env("GTK_THEME", "Adwaita:dark")


-------------------
---- AUTOSTART ----
-------------------

-- See https://wiki.hypr.land/Configuring/Basics/Autostart/
hl.on("hyprland.start", function()
    hl.exec_cmd("hyprctl setcursor catppuccin-mocha-pink-cursors 32")
    hl.exec_cmd("hyprpaper")
    hl.exec_cmd("waybar")
    -- hl.exec_cmd("nm-applet")
end)


-----------------------
----- PERMISSIONS -----
-----------------------

-- See https://wiki.hypr.land/Configuring/Advanced-and-Cool/Permissions/
-- Please note permission changes here require a Hyprland restart and are not applied on-the-fly
-- for security reasons

-- hl.config({
--   ecosystem = {
--     enforce_permissions = true,
--   },
-- })

-- hl.permission("/usr/(bin|local/bin)/grim", "screencopy", "allow")
-- hl.permission("/usr/(lib|libexec|lib64)/xdg-desktop-portal-hyprland", "screencopy", "allow")
-- hl.permission("/usr/(bin|local/bin)/hyprpm", "plugin", "allow")


-----------------------
---- LOOK AND FEEL ----
-----------------------

-- Catppuccin Mocha palette, shared with waybar/wofi
local mocha = {
    mauve   = "cba6f7",
    pink    = "f5c2e7",
    yellow  = "f9e2af",
    peach   = "fab387",
    red     = "f38ba8",
    surface0 = "313244",
    surface1 = "45475a",
    overlay0 = "6c7086",
    crust   = "11111b",
}
local function rgba(hex, alpha) return "rgba(" .. hex .. (alpha or "ff") .. ")" end

-- Refer to https://wiki.hypr.land/Configuring/Basics/Variables/
hl.config({
    general = {
        gaps_in  = 3,
        gaps_out = 6,

        border_size = 2,

        col = {
            -- animated by the "borderangle" loop below
            active_border   = { colors = { rgba(mocha.mauve), rgba(mocha.pink), rgba(mocha.yellow) }, angle = 45 },
            inactive_border = rgba(mocha.surface0, "cc"),
        },

        -- Set to true to enable resizing windows by clicking and dragging on borders and gaps
        resize_on_border = false,

        -- Please see https://wiki.hypr.land/Configuring/Advanced-and-Cool/Tearing/ before you turn this on
        allow_tearing = false,

        layout = "dwindle",
    },

    decoration = {
        -- square corners everywhere
        rounding = 0,

        -- Change transparency of focused and unfocused windows
        active_opacity   = 1.0,
        inactive_opacity = 0.94,

        -- gently darken unfocused windows so focus is obvious without a thick border
        dim_inactive = true,
        dim_strength = 0.08,
        dim_special  = 0.4,

        shadow = {
            enabled       = true,
            range         = 14,
            render_power  = 3,
            color         = rgba(mocha.crust, "dd"),
            color_inactive = rgba(mocha.crust, "66"),
        },

        blur = {
            enabled           = true,
            size              = 6,
            passes            = 3,
            noise             = 0.02,
            contrast          = 1.0,
            brightness        = 0.9,
            vibrancy          = 0.17,
            vibrancy_darkness = 0.2,
            popups            = true,
            special           = true,
            new_optimizations = true,
        },
    },

    group = {
        col = {
            border_active   = { colors = { rgba(mocha.peach), rgba(mocha.yellow) }, angle = 45 },
            border_inactive = rgba(mocha.surface1, "cc"),
        },
        groupbar = {
            rounding  = 0,
            font_size = 12,
            height    = 18,
            col = {
                active   = rgba(mocha.mauve, "dd"),
                inactive = rgba(mocha.surface1, "aa"),
            },
            text_color = rgba(mocha.crust),
        },
    },

    animations = {
        enabled = true, -- yes, please :)
    },
})

-- Blur behind translucent layers
hl.layer_rule({
    name  = "wofi-blur",
    match = { namespace = "wofi" },

    blur         = true,
    ignore_alpha = 0,
})

hl.layer_rule({
    name  = "waybar-blur",
    match = { namespace = "waybar" },

    blur         = true,
    ignore_alpha = 0.3,
})

-- Curves and animations, see https://wiki.hypr.land/Configuring/Advanced-and-Cool/Animations/
hl.curve("easeOutQuint",   { type = "bezier", points = { {0.23, 1},    {0.32, 1} } })
hl.curve("easeInOutCubic", { type = "bezier", points = { {0.65, 0.05}, {0.36, 1} } })
hl.curve("linear",         { type = "bezier", points = { {0, 0},       {1, 1}    } })
hl.curve("almostLinear",   { type = "bezier", points = { {0.5, 0.5},   {0.75, 1} } })
hl.curve("quick",          { type = "bezier", points = { {0.15, 0},    {0.1, 1}  } })
hl.curve("overshot",       { type = "bezier", points = { {0.05, 0.9},  {0.1, 1.05} } })

hl.animation({ leaf = "global",           enabled = true, speed = 10,   bezier = "default" })
hl.animation({ leaf = "border",           enabled = true, speed = 5.39, bezier = "easeOutQuint" })
hl.animation({ leaf = "borderangle",      enabled = true, speed = 60,   bezier = "linear",       style = "loop" })
hl.animation({ leaf = "windows",          enabled = true, speed = 4.79, bezier = "easeOutQuint" })
hl.animation({ leaf = "windowsIn",        enabled = true, speed = 4.1,  bezier = "overshot",     style = "popin 90%" })
hl.animation({ leaf = "windowsOut",       enabled = true, speed = 1.49, bezier = "linear",       style = "popin 90%" })
hl.animation({ leaf = "windowsMove",      enabled = true, speed = 4,    bezier = "easeOutQuint" })
hl.animation({ leaf = "fadeIn",           enabled = true, speed = 1.73, bezier = "almostLinear" })
hl.animation({ leaf = "fadeOut",          enabled = true, speed = 1.46, bezier = "almostLinear" })
hl.animation({ leaf = "fade",             enabled = true, speed = 3.03, bezier = "quick" })
hl.animation({ leaf = "fadeDim",          enabled = true, speed = 3,    bezier = "easeOutQuint" })
hl.animation({ leaf = "layers",           enabled = true, speed = 3.81, bezier = "easeOutQuint" })
hl.animation({ leaf = "layersIn",         enabled = true, speed = 4,    bezier = "easeOutQuint", style = "fade" })
hl.animation({ leaf = "layersOut",        enabled = true, speed = 1.5,  bezier = "linear",       style = "fade" })
hl.animation({ leaf = "fadeLayersIn",     enabled = true, speed = 1.79, bezier = "almostLinear" })
hl.animation({ leaf = "fadeLayersOut",    enabled = true, speed = 1.39, bezier = "almostLinear" })
hl.animation({ leaf = "workspaces",       enabled = true, speed = 3,    bezier = "easeOutQuint", style = "slide" })
hl.animation({ leaf = "specialWorkspace", enabled = true, speed = 3,    bezier = "easeOutQuint", style = "slidevert" })
hl.animation({ leaf = "zoomFactor",       enabled = true, speed = 7,    bezier = "quick" })

-- Ref https://wiki.hypr.land/Configuring/Basics/Workspace-Rules/
-- "Smart gaps" / "No gaps when only"
-- uncomment all if you wish to use that.
-- hl.workspace_rule({ workspace = "w[tv1]", gaps_out = 0, gaps_in = 0 })
-- hl.workspace_rule({ workspace = "f[1]",   gaps_out = 0, gaps_in = 0 })
-- hl.window_rule({
--     name  = "no-gaps-wtv1",
--     match = { float = false, workspace = "w[tv1]" },
--     border_size = 0,
--     rounding    = 0,
-- })
-- hl.window_rule({
--     name  = "no-gaps-f1",
--     match = { float = false, workspace = "f[1]" },
--     border_size = 0,
--     rounding    = 0,
-- })

hl.config({
    -- See https://wiki.hypr.land/Configuring/Layouts/Dwindle-Layout/ for more
    dwindle = {
        -- pseudotile = true, -- Master switch for pseudotiling
        preserve_split = true, -- You probably want this
    },

    -- See https://wiki.hypr.land/Configuring/Layouts/Master-Layout/ for more
    master = {
        new_status = "master",
    },
})


----------------
----  MISC  ----
----------------

hl.config({
    misc = {
        force_default_wallpaper = 0,    -- hyprpaper draws the wallpaper
        disable_hyprland_logo   = true,
        disable_splash_rendering = true,
        background_color        = 0xff11111b, -- Catppuccin crust behind everything
        animate_manual_resizes  = true,
        animate_mouse_windowdragging = true,
    },

    debug = {
        disable_logs = false,
    },

    xwayland = {
        force_zero_scaling = true,
    },
})


---------------
---- INPUT ----
---------------

hl.config({
    input = {
        kb_layout  = "us",
        kb_variant = "",
        kb_model   = "",
        kb_options = "",
        kb_rules   = "",

        follow_mouse = 1,

        sensitivity = -1.0, -- -1.0 - 1.0, 0 means no modification.

        touchpad = {
            natural_scroll = false,
        },
    },
})

-- See https://wiki.hypr.land/Configuring/Advanced-and-Cool/Gestures/
hl.gesture({
    fingers   = 3,
    direction = "horizontal",
    action    = "workspace",
})

-- Example per-device config
-- See https://wiki.hypr.land/Configuring/Advanced-and-Cool/Devices/ for more
hl.device({
    name        = "epic-mouse-v1",
    sensitivity = -0.5,
})


---------------------
---- KEYBINDINGS ----
---------------------

local mainMod = "SUPER" -- Sets "Windows" key as main modifier

-- See https://wiki.hypr.land/Configuring/Basics/Binds/ for more
hl.bind(mainMod .. " + RETURN", hl.dsp.exec_cmd(terminal .. " 2>&1 | tee -a ~/term-error.log"))
hl.bind(mainMod .. " + x",      hl.dsp.window.close())
hl.bind(mainMod .. " + m",      hl.dsp.exit())
hl.bind(mainMod .. " + e",      hl.dsp.exec_cmd(fileManager))
hl.bind(mainMod .. " + v",      hl.dsp.window.float({ action = "toggle" }))
hl.bind(mainMod .. " + space",  hl.dsp.exec_cmd(menu))
-- hl.bind(mainMod .. " + P", hl.dsp.window.pseudo())         -- dwindle
-- hl.bind(mainMod .. " + X", hl.dsp.layout("togglesplit"))   -- dwindle

-- Move focus / swap / resize with mainMod (+ SHIFT / ALT) + hjkl
local directions = {
    h = { dir = "left",  x = -5, y = 0 },
    l = { dir = "right", x = 5,  y = 0 },
    k = { dir = "up",    x = 0,  y = -5 },
    j = { dir = "down",  x = 0,  y = 5 },
}
for key, d in pairs(directions) do
    hl.bind(mainMod .. " + " .. key,         hl.dsp.focus({ direction = d.dir }))
    hl.bind(mainMod .. " + SHIFT + " .. key, hl.dsp.window.swap({ direction = d.dir }))
    hl.bind(mainMod .. " + ALT + " .. key,   hl.dsp.window.resize({ x = d.x, y = d.y, relative = true }), { repeating = true })
end

hl.bind(mainMod .. " + o", hl.dsp.layout("preselect d"))
hl.bind(mainMod .. " + u", hl.dsp.layout("preselect r"))

-- Switch workspaces with mainMod + [0-9]
-- Move active window to a workspace with mainMod + SHIFT + [0-9]
for i = 1, 10 do
    local key = i % 10 -- 10 maps to key 0
    hl.bind(mainMod .. " + " .. key,         hl.dsp.focus({ workspace = i }))
    hl.bind(mainMod .. " + SHIFT + " .. key, hl.dsp.window.move({ workspace = i }))
end

-- Special workspace (scratchpad)
hl.bind(mainMod .. " + S",         hl.dsp.workspace.toggle_special("magic"))
hl.bind(mainMod .. " + SHIFT + S", hl.dsp.window.move({ workspace = "special:magic" }))

-- Scroll through existing workspaces with mainMod + scroll
hl.bind(mainMod .. " + mouse_down", hl.dsp.focus({ workspace = "e+1" }))
hl.bind(mainMod .. " + mouse_up",   hl.dsp.focus({ workspace = "e-1" }))

-- Move/resize windows with mainMod + LMB/RMB and dragging
hl.bind(mainMod .. " + mouse:272", hl.dsp.window.drag(),   { mouse = true })
hl.bind(mainMod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true })

-- Multimedia keys for volume and LCD brightness
hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd("wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+"), { locked = true, repeating = true })
hl.bind("XF86AudioLowerVolume", hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"),      { locked = true, repeating = true })
hl.bind("XF86AudioMute",        hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"),     { locked = true, repeating = true })
hl.bind("XF86AudioMicMute",     hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"),   { locked = true, repeating = true })
-- hl.bind("XF86MonBrightnessUp",   hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%+"), { locked = true, repeating = true })
-- hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%-"), { locked = true, repeating = true })

-- Requires playerctl
hl.bind("XF86AudioNext",  hl.dsp.exec_cmd("playerctl next"),       { locked = true })
hl.bind("XF86AudioPause", hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPlay",  hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPrev",  hl.dsp.exec_cmd("playerctl previous"),   { locked = true })


--------------------------------
---- WINDOWS AND WORKSPACES ----
--------------------------------

-- See https://wiki.hypr.land/Configuring/Basics/Window-Rules/
-- and https://wiki.hypr.land/Configuring/Basics/Workspace-Rules/

hl.window_rule({
    -- Ignore maximize requests from all apps. You'll probably like this.
    name  = "suppress-maximize-events",
    match = { class = ".*" },

    suppress_event = "maximize",
})

hl.window_rule({
    -- Fix some dragging issues with XWayland
    name  = "fix-xwayland-drags",
    match = {
        class      = "^$",
        title      = "^$",
        xwayland   = true,
        float      = true,
        fullscreen = false,
        pin        = false,
    },

    no_focus = true,
})

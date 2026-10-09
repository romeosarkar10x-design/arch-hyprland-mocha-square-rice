// _ds_bundle.js and every _preview/*.js read React from window.React at evaluation
// time. This must be its own module so it runs before the bundle import (imports hoist).
import * as React from "react";

// A plain copy, not the namespace itself: the bundle's React shim writes jsx/Fragment onto
// window.React, and in production builds the namespace object's properties are getter-only.
window.React = { ...React };

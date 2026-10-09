// _ds_bundle.js and every _preview/*.js read React from window.React at evaluation
// time. This must be its own module so it runs before the bundle import (imports hoist).
import * as React from "react";

window.React = React;

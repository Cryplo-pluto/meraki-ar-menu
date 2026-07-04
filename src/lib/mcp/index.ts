import { defineMcp } from "@lovable.dev/mcp-js";
import listMenuItemsTool from "./tools/list-menu-items";
import getMenuItemTool from "./tools/get-menu-item";
import listCakesTool from "./tools/list-cakes";
import listBranchesTool from "./tools/list-branches";

export default defineMcp({
  name: "meraki-cafe-mcp",
  title: "Meraki Cafe MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for Meraki Cafe (Lusaka, Zambia). Use `list_menu_items` to browse the menu (optionally by category or signature only), `get_menu_item` for full details including AR model URLs, `list_cakes` for the cakery, and `list_branches` for locations, hours, and contact info.",
  tools: [listMenuItemsTool, getMenuItemTool, listCakesTool, listBranchesTool],
});
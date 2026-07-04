import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/10">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-bold text-primary">meraki</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Meraki — cooked with soul, since 2008. Rhodespark · Eastpark · Kabulonga, Lusaka.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link to="/cakes" className="hover:text-primary">Cakes</Link></li>
            <li><Link to="/cake-builder" className="hover:text-primary">Build a cake</Link></li>
            <li><Link to="/ar" className="hover:text-primary">Our AR menu</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Visit</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/locations" className="hover:text-primary">All locations</Link></li>
            <li><Link to="/catering" className="hover:text-primary">Catering</Link></li>
            <li><Link to="/about" className="hover:text-primary">Our story</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Meraki Cafe Lusaka. All rights reserved.
      </div>
    </footer>
  );
}
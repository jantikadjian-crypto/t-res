import { forwardRef, type AnchorHTMLAttributes } from "react";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
};

// Stand-in for next/link in the progress artifact, where routes live in the URL hash.
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const { href, ...anchor } = props;
  delete anchor.prefetch;
  delete anchor.replace;
  delete anchor.scroll;
  return <a ref={ref} {...anchor} href={href.startsWith("#") ? href : `#${href}`} />;
});

export default Link;

import { ISerializedComponent } from '@pubstudio/shared/type-site'
import { button } from './builtin-button'
import { containerHorizontal } from './builtin-container-horizontal'
import { containerVertical } from './builtin-container-vertical'
import { footer } from './builtin-footer'
import { h1, h2, h3, h4, h5, h6 } from './builtin-h'
import { header, headerLogo, headerLogoLink, headerNavMenu } from './builtin-header'
import { image } from './builtin-image'
import { input } from './builtin-input'
import { link } from './builtin-link'
import { navMenu, navMenuItem } from './builtin-nav-menu'
import { svg } from './builtin-svg'
import { text } from './builtin-text'

export const builtinComponents: Record<string, ISerializedComponent> = {
  [containerHorizontal.id]: containerHorizontal,
  [containerVertical.id]: containerVertical,
  [text.id]: text,
  [h1.id]: h1,
  [h2.id]: h2,
  [h3.id]: h3,
  [h4.id]: h4,
  [h5.id]: h5,
  [h6.id]: h6,
  [image.id]: image,
  [svg.id]: svg,
  [link.id]: link,
  [button.id]: button,
  [navMenu.id]: navMenu,
  [header.id]: header,
  [headerLogoLink.id]: headerLogoLink,
  [headerLogo.id]: headerLogo,
  [headerNavMenu.id]: headerNavMenu,
  [navMenu.id]: navMenu,
  [navMenuItem.id]: navMenuItem,
  [footer.id]: footer,
  [input.id]: input,
}

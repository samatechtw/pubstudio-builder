import { IStyle } from '@pubstudio/shared/type-site'
import { buttonStyle } from './components/builtin-button'
import { horizontalStyle } from './components/builtin-container-horizontal'
import { verticalStyle } from './components/builtin-container-vertical'
import {
  dividerHorizontalStyle,
  dividerVerticalStyle,
} from './components/builtin-divider'
import { footerStyle } from './components/builtin-footer'
import { gridStyle } from './components/builtin-grid'
import {
  h1Style,
  h2Style,
  h3Style,
  h4Style,
  h5Style,
  h6Style,
} from './components/builtin-h'
import { headerStyle } from './components/builtin-header'
import {
  backgroundImageStyle,
  captionedImageStyle,
  imageStyle,
} from './components/builtin-image'
import { gridImageStyle, imageGalleryStyle } from './components/builtin-image-gallery'
import { inputStyle } from './components/builtin-input'
import { labelStyle } from './components/builtin-label'
import {
  caretBubbleStyle,
  caretRightStyle,
  langDisplayStyle,
  langOptionsStyle,
  langOptionStyle,
  langTextStyle,
} from './components/builtin-languages'
import {
  imageNavStyle,
  lightboxContentStyle,
  lightboxGalleryStyle,
  lightboxIconWrapStyle,
  lightboxWrapStyle,
} from './components/builtin-lightbox-gallery'
import { linkStyle } from './components/builtin-link'
import { listItemStyle, listStyle } from './components/builtin-list'
import { loadingDotStyle, loadingStyle } from './components/builtin-loading'
import { navMenuItemStyle, navMenuStyle } from './components/builtin-nav-menu'
import { svgStyle } from './components/builtin-svg'
import { textStyle } from './components/builtin-text'
import { textareaStyle } from './components/builtin-textarea'
import { videoStyle, videoWrapStyle } from './components/builtin-video'

export const builtinStyles: Record<string, IStyle> = {
  [horizontalStyle.id]: horizontalStyle,
  [verticalStyle.id]: verticalStyle,
  [gridStyle.id]: gridStyle,
  [gridImageStyle.id]: gridImageStyle,
  [imageGalleryStyle.id]: imageGalleryStyle,
  [lightboxGalleryStyle.id]: lightboxGalleryStyle,
  [lightboxWrapStyle.id]: lightboxWrapStyle,
  [lightboxContentStyle.id]: lightboxContentStyle,
  [lightboxIconWrapStyle.id]: lightboxIconWrapStyle,
  [imageNavStyle.id]: imageNavStyle,
  [textStyle.id]: textStyle,
  [h1Style.id]: h1Style,
  [h2Style.id]: h2Style,
  [h3Style.id]: h3Style,
  [h4Style.id]: h4Style,
  [h5Style.id]: h5Style,
  [h6Style.id]: h6Style,
  [imageStyle.id]: imageStyle,
  [captionedImageStyle.id]: captionedImageStyle,
  [backgroundImageStyle.id]: backgroundImageStyle,
  [videoStyle.id]: videoStyle,
  [videoWrapStyle.id]: videoWrapStyle,
  [navMenuStyle.id]: navMenuStyle,
  [navMenuItemStyle.id]: navMenuItemStyle,
  [svgStyle.id]: svgStyle,
  [linkStyle.id]: linkStyle,
  [buttonStyle.id]: buttonStyle,
  [headerStyle.id]: headerStyle,
  [footerStyle.id]: footerStyle,
  [inputStyle.id]: inputStyle,
  [textareaStyle.id]: textareaStyle,
  [labelStyle.id]: labelStyle,
  [loadingStyle.id]: loadingStyle,
  [loadingDotStyle.id]: loadingDotStyle,
  [listStyle.id]: listStyle,
  [listItemStyle.id]: listItemStyle,
  [dividerHorizontalStyle.id]: dividerHorizontalStyle,
  [dividerVerticalStyle.id]: dividerVerticalStyle,
  [caretBubbleStyle.id]: caretBubbleStyle,
  [caretRightStyle.id]: caretRightStyle,
  [langDisplayStyle.id]: langDisplayStyle,
  [langOptionStyle.id]: langOptionStyle,
  [langOptionsStyle.id]: langOptionsStyle,
  [langTextStyle.id]: langTextStyle,
}

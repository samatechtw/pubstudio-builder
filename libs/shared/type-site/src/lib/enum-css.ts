export enum Css {
  Empty = '',
  WebkitBackgroundClip = '-webkit-background-clip',
  WebkitTextFillColor = '-webkit-text-fill-color',
  AlignContent = 'align-content',
  AlignItems = 'align-items',
  Animation = 'animation',
  AspectRatio = 'aspect-ratio',
  Background = 'background',
  BackgroundColor = 'background-color',
  BackgroundImage = 'background-image',
  BackgroundOrigin = 'background-origin',
  BackgroundPosition = 'background-position',
  BackgroundRepeat = 'background-repeat',
  BackgroundSize = 'background-size',
  Border = 'border',
  BorderBottom = 'border-bottom',
  BorderBottomLeftRadius = 'border-bottom-left-radius',
  BorderBottomRightRadius = 'border-bottom-right-radius',
  BorderColor = 'border-color',
  BorderEndEndRadius = 'border-end-end-radius',
  BorderEndStartRadius = 'border-end-start-radius',
  BorderLeft = 'border-left',
  BorderRadius = 'border-radius',
  BorderRight = 'border-right',
  BorderStartEndRadius = 'border-start-end-radius',
  BorderStartStartRadius = 'border-start-start-radius',
  BorderTop = 'border-top',
  BorderTopLeftRadius = 'border-top-left-radius',
  BorderTopRightRadius = 'border-top-right-radius',
  BorderWidth = 'border-width',
  BoxShadow = 'box-shadow',
  Bottom = 'bottom',
  Color = 'color',
  Cursor = 'cursor',
  Display = 'display',
  Flex = 'flex',
  FlexDirection = 'flex-direction',
  FlexWrap = 'flex-wrap',
  FontFamily = 'font-family',
  FontSize = 'font-size',
  FontStyle = 'font-style',
  FontWeight = 'font-weight',
  Height = 'height',
  JustifyContent = 'justify-content',
  Left = 'left',
  LetterSpacing = 'letter-spacing',
  Margin = 'margin',
  MaxHeight = 'max-height',
  MaxWidth = 'max-width',
  MinHeight = 'min-height',
  MinWidth = 'min-width',
  ObjectFit = 'object-fit',
  Opacity = 'opacity',
  Outline = 'outline',
  OutlineStyle = 'outline-style',
  Overflow = 'overflow',
  Padding = 'padding',
  PointerEvents = 'pointer-events',
  Position = 'position',
  Right = 'right',
  // Rotate function
  Rotate = 'rotate',
  // Scale function
  Scale = 'scale',
  ScrollBehavior = 'scroll-behavior',
  TextAlign = 'text-align',
  TextDecoration = 'text-decoration',
  TextOverflow = 'text-overflow',
  TextShadow = 'text-shadow',
  Top = 'top',
  Transform = 'transform',
  TransformOrigin = 'transform-origin',
  Transition = 'transition',
  // Translate function
  Translate = 'translate',
  UserSelect = 'user-select',
  Visibility = 'visibility',
  WhiteSpace = 'white-space',
  Width = 'width',
  WordBreak = 'word-break',
  WorkSpacing = 'word-spacing',
  WordWrap = 'word-wrap',
  ZIndex = 'z-index',
}

export const CssValues: Css[] = Object.values(Css).filter((css) => css !== Css.Empty)

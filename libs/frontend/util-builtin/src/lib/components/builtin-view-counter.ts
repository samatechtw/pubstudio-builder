import {
  horizontalStyleId,
  viewCounterBehaviorId,
  viewCounterId,
} from '@pubstudio/frontend/util-ids'
import { ComponentEventType, IComponent, Tag } from '@pubstudio/shared/type-site'
import { makeText } from './builtin-text'
import { defaultStyle } from './helpers'

export const viewCounter: IComponent = {
  id: viewCounterId,
  name: 'ViewCounterWrap',
  tag: Tag.Div,
  style: {
    custom: defaultStyle({ 'justify-content': 'center' }),
    mixins: [horizontalStyleId],
  },
  children: [
    makeText('ViewCounterLabel', 'Site visits:', defaultStyle({})),
    {
      ...makeText(
        'ViewCounter',
        '0',
        defaultStyle({ 'font-weight': '700', margin: '0px 0px 0px 6px' }),
      ),
      events: {
        [ComponentEventType.OnAppear]: {
          name: ComponentEventType.OnAppear,
          behaviors: [{ behaviorId: viewCounterBehaviorId, args: { counterId: '' } }],
        },
      },
    },
  ],
}

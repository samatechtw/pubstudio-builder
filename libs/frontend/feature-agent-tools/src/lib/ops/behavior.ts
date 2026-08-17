import { clone } from '@pubstudio/frontend/util-component'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  ISetBehaviorArgData,
  ISetBehaviorData,
} from '@pubstudio/shared/type-command-data'
import { ComponentArgPrimitive, ComponentArgType } from '@pubstudio/shared/type-site'
import { defineOp } from '../op/define-op'
import { constraint, mustResolveBehavior } from '../op/op-helpers'
import { ARG_TYPES, behaviorIdField } from '../schema/fields'
import { bool, json, obj, oneOf, str } from '../schema/schema'

export const setBehaviorOp = defineOp<ISetBehaviorData>()({
  name: 'setBehavior',
  command: CommandType.SetBehavior,
  title: 'Create or update a behavior',
  description:
    'Create a behavior (omit `behaviorId`), update an existing one, or delete it with ' +
    '`remove: true`. `code` is the body of a function called with `helpers`, ' +
    '`behaviorContext` ({site, component, event}) and `args`. Wire it to a component with ' +
    'setComponentEvent. New ids are returned in createdBehaviorIds.',
  input: obj({
    behaviorId: behaviorIdField()
      .optional()
      .desc('Existing behavior id. Omit to create a new behavior.'),
    name: str()
      .optional()
      .desc('Behavior name shown in the builder. Required on create.'),
    code: str().optional().desc('JavaScript function body.'),
    remove: bool()
      .dflt(false)
      .desc(
        'Delete the behavior. Component events still referencing it keep a dangling id, ' +
          'so clear those with setComponentEvent first.',
      ),
  }),
  derived: ['oldBehavior', 'newBehavior'],
  omitted: {},
  resolve: (ctx, input) => {
    const oldBehavior = input.behaviorId
      ? clone(mustResolveBehavior(ctx.site, input.behaviorId))
      : undefined
    if (input.remove) {
      if (!oldBehavior) {
        constraint('remove needs a behaviorId.')
      }
      return {
        type: CommandType.SetBehavior,
        data: { oldBehavior, newBehavior: undefined },
      }
    }
    const name = input.name ?? oldBehavior?.name
    if (!name) {
      constraint('A new behavior needs a name.')
    }
    const data: ISetBehaviorData = {
      oldBehavior,
      newBehavior: {
        id: oldBehavior?.id,
        name,
        args: oldBehavior?.args,
        code: input.code ?? oldBehavior?.code,
      },
    }
    return { type: CommandType.SetBehavior, data }
  },
  example: () => ({
    name: 'Agent behavior',
    code: 'helpers.setContent(component, "clicked")',
  }),
})

export const setBehaviorArgOp = defineOp<ISetBehaviorArgData>()({
  name: 'setBehaviorArg',
  command: CommandType.SetBehaviorArg,
  title: 'Set a behavior argument',
  description:
    'Declare, update or remove an argument a behavior accepts. Values are supplied per ' +
    'component in setComponentEvent({behaviors:[{args}]}). Omit `type` and `help` to ' +
    'remove the argument.',
  input: obj({
    behaviorId: behaviorIdField(),
    name: str().desc('Argument name.'),
    type: oneOf(ARG_TYPES).optional().desc('Argument type. Omit to remove the argument.'),
    help: str().dflt('').desc('Help text shown in the builder.'),
    default: json().optional().desc('Default value when a component omits the argument.'),
  }),
  derived: ['oldArg', 'newArg'],
  omitted: {},
  resolve: (ctx, input) => {
    const behavior = mustResolveBehavior(ctx.site, input.behaviorId)
    const oldArg = behavior.args?.[input.name]
    if (!input.type && !oldArg) {
      constraint(`Behavior ${behavior.id} has no argument "${input.name}" to remove.`)
    }
    const data: ISetBehaviorArgData = {
      behaviorId: behavior.id,
      oldArg: oldArg ? { ...oldArg } : undefined,
      newArg: input.type
        ? {
            name: input.name,
            type: input.type as ComponentArgType,
            help: input.help ?? '',
            default: input.default,
          }
        : undefined,
    }
    return { type: CommandType.SetBehaviorArg, data }
  },
  example: (site) => ({
    behaviorId: Object.keys(site.context.behaviors)[0],
    name: 'target',
    type: ComponentArgPrimitive.String,
    help: 'Component id to update',
  }),
})

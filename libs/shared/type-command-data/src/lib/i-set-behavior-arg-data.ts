import { IBehaviorArg } from '@pubstudio/shared/type-site'

export interface ISetBehaviorArgData {
  behaviorId: string
  oldArg?: IBehaviorArg
  newArg?: IBehaviorArg
}

import { IBehavior } from '@pubstudio/shared/type-site'

export interface INewBehavior extends Omit<IBehavior, 'id'> {
  id?: string
}

export interface ISetBehaviorData {
  oldBehavior?: IBehavior
  newBehavior?: INewBehavior
}

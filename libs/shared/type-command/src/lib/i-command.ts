import { CommandType } from './command-type'

export interface ICommand<Data = unknown> {
  type: CommandType
  data: Data
}

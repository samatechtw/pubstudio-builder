import { Ref, ref } from 'vue'

export interface IHUDOptions {
  text: string
  /**
   * @default 1000
   */
  duration?: number
}

export interface IHUD {
  id: string
  text: string
  duration: number
}

export interface IHUDFeature {
  huds: Ref<IHUD[]>
  addHUD: (options: IHUDOptions) => void
}

const huds: Ref<IHUD[]> = ref([])
let hudCount = 0

export const useHUD = (): IHUDFeature => {
  const addHUD = ({ text, duration = 1500 }: IHUDOptions) => {
    const id = `__hud_${hudCount.toString()}`
    const hud: IHUD = {
      id,
      text,
      duration,
    }
    hudCount += 1

    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId)
      huds.value = huds.value.filter((hud) => hud.id !== id)
    }, duration)

    huds.value.push(hud)
  }

  return {
    huds,
    addHUD,
  }
}

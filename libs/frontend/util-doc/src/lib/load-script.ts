export const loadScript = (scriptId: string, scriptSrc: string): Promise<boolean> => {
  return new Promise(function (resolve, reject) {
    let shouldAdd = false
    let el = document.getElementById(scriptId) as HTMLScriptElement
    if (!el) {
      el = document.createElement('script')
      el.type = 'text/javascript'
      el.async = true
      el.id = scriptId
      el.src = scriptSrc
      shouldAdd = true
    } else if (el.hasAttribute('data-loaded')) {
      resolve(false)
      return
    }

    el.addEventListener('error', reject)
    el.addEventListener('abort', reject)
    el.addEventListener('load', function loadScriptHandler() {
      el.setAttribute('data-loaded', 'true')
      resolve(true)
    })

    if (shouldAdd) {
      document.head.appendChild(el)
    }
  })
}

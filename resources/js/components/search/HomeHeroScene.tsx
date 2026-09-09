import { useEffect, useRef } from 'react'
import type { Group, Object3D, Texture, Material } from 'three'
import fallback from '../../../images/mauritius-home-renovation-living-room.webp'

export function HomeHeroScene() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || !window.WebGL2RenderingContext) return
    let disposed = false
    let teardown: (() => void) | undefined

    async function initialize() {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import('three'),
        import('three/addons/loaders/GLTFLoader.js'),
      ])
      if (disposed || !host) return
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.3
      renderer.domElement.className =
        'h-full w-full opacity-0 transition-opacity duration-700 motion-reduce:transition-none'
      host.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xaca99f)
      const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000)
      scene.add(new THREE.HemisphereLight(0xffffff, 0x8d8274, 2.5))
      const sunlight = new THREE.DirectionalLight(0xfff2dd, 3)
      sunlight.position.set(4, 8, 5)
      scene.add(sunlight)
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      let model: Group | null = null
      let frame = 0
      let visible = true
      let progress = 0
      let targetProgress = 0
      // Move into the room while zooming and turning through a 38-degree panorama.
      const cameraStart = new THREE.Vector3(5.8, 1.45, 1.8)
      const initialDirection = new THREE.Vector3(-6.4, -0.25, -5.2)
      const forward = new THREE.Vector3(-6.4, 0, -5.2).normalize()
      const lookTarget = new THREE.Vector3()
      const up = new THREE.Vector3(0, 1, 0)

      function disposeModel(object: Object3D) {
        const textures = new Set<Texture>()
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return
          child.geometry.dispose()
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material: Material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) textures.add(value)
            })
            material.dispose()
          })
        })
        textures.forEach((texture) => {
          const data = texture.source.data
          if (typeof ImageBitmap !== 'undefined' && data instanceof ImageBitmap) data.close()
          texture.dispose()
        })
      }

      function render() {
        frame = 0
        if (disposed || !visible || document.hidden || !model) return
        progress = reducedMotion.matches ? 0 : progress + (targetProgress - progress) * 0.12
        const sweep = (progress * Math.PI) / 2
        camera.position.set(
          cameraStart.x - Math.sin(sweep) * 0.9,
          cameraStart.y,
          cameraStart.z - (1 - Math.cos(sweep)) * 0.3,
        )
        camera.position.addScaledVector(forward, progress * 0.8)
        camera.zoom = 1 + progress * 0.3
        camera.updateProjectionMatrix()
        lookTarget
          .copy(initialDirection)
          .applyAxisAngle(up, -THREE.MathUtils.degToRad(38) * progress)
          .add(camera.position)
        camera.lookAt(lookTarget)
        renderer.render(scene, camera)
        if (!reducedMotion.matches && Math.abs(targetProgress - progress) > 0.001) schedule()
      }
      function schedule() {
        if (!frame && !disposed) frame = window.requestAnimationFrame(render)
      }
      function updateScroll() {
        const page = host!.parentElement
        if (!page) return
        const rect = page.getBoundingClientRect()
        const scrollDistance = Math.max(1, rect.height - window.innerHeight)
        targetProgress = Math.max(0, Math.min(1, -rect.top / scrollDistance))
        schedule()
      }
      const resize = new ResizeObserver(() => {
        const { width, height } = host.getBoundingClientRect()
        if (!width || !height) return
        renderer.setSize(width, height)
        camera.aspect = width / height
        // Crop the interior on narrow screens, without stretching a wide hero view.
        camera.fov = THREE.MathUtils.radToDeg(
          2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(75) / 2) / Math.max(camera.aspect, 1)),
        )
        camera.updateProjectionMatrix()
        updateScroll()
      })
      resize.observe(host)
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? false
        if (visible) updateScroll()
      })
      intersection.observe(host.parentElement ?? host)
      window.addEventListener('scroll', updateScroll, { passive: true })
      document.addEventListener('visibilitychange', schedule)
      reducedMotion.addEventListener('change', schedule)
      const contextLost = (event: Event) => {
        event.preventDefault()
        renderer.domElement.style.opacity = '0'
      }
      renderer.domElement.addEventListener('webglcontextlost', contextLost)
      teardown = () => {
        window.cancelAnimationFrame(frame)
        resize.disconnect()
        intersection.disconnect()
        window.removeEventListener('scroll', updateScroll)
        document.removeEventListener('visibilitychange', schedule)
        reducedMotion.removeEventListener('change', schedule)
        renderer.domElement.removeEventListener('webglcontextlost', contextLost)
        if (model) disposeModel(model)
        renderer.dispose()
        renderer.domElement.remove()
      }
      const gltf = await new GLTFLoader().loadAsync('/models/the_interior_14_is_spacious.glb')
      if (disposed) {
        disposeModel(gltf.scene)
        return
      }
      model = gltf.scene
      camera.near = 0.02
      camera.far = 100
      camera.updateProjectionMatrix()
      scene.add(model)
      updateScroll()
      renderer.domElement.style.opacity = '1'
    }
    void initialize().catch(() => teardown?.())
    return () => {
      disposed = true
      teardown?.()
    }
  }, [])

  return (
    <div ref={hostRef} className="pointer-events-none fixed inset-0 -z-20 overflow-hidden" aria-hidden="true">
      <img
        src={fallback}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        fetchPriority="high"
      />
    </div>
  )
}

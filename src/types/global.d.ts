// types/global.d.ts
// Global TypeScript declarations

declare global {
	interface Window {
		ymaps: ymaps.YMapsApi
		gtag: (...args: unknown[]) => void
	}
}

// Yandex Maps API v2.1 TypeScript declarations
declare namespace ymaps {
	type YMapsApi = typeof ymaps

	// Main API
	function ready(callback?: () => void): Promise<void>

	// Map
	class Map {
		constructor(
			container: string | HTMLElement,
			state: MapState,
			options?: MapOptions
		)

		geoObjects: GeoObjectCollection
		controls: ControlCollection
		events: EventManager
		behaviors: BehaviorManager

		getCenter(): number[]
		getZoom(): number
		getBounds(): number[][]
		getType(): string

		setCenter(center: number[], zoom?: number, options?: object): Promise<void>
		setZoom(zoom: number, options?: object): Promise<void>
		setBounds(bounds: number[][], options?: object): Promise<void>
		setType(type: string, options?: object): Promise<void>

		destroy(): void
		getContainer(): HTMLElement

		// Coordinate system methods
		converter: {
			globalToPage(globalPixelPoint: number[]): number[]
			pageToGlobal(pagePixelPoint: number[]): number[]
			globalToScreen(globalPixelPoint: number[]): number[]
			screenToGlobal(screenPixelPoint: number[]): number[]
		}
	}

	interface MapState {
		center: number[]
		zoom: number
		controls?: string[]
		type?: 'yandex#map' | 'yandex#satellite' | 'yandex#hybrid'
		behaviors?: string[]
	}

	interface MapOptions {
		minZoom?: number
		maxZoom?: number
		restrictMapArea?: boolean | number[][]
		suppressMapOpenBlock?: boolean
		yandexMapDisablePoiInteractivity?: boolean
		autoFitToViewport?: 'none' | 'ifNull' | 'always'
		avoidFractionalZoom?: boolean
		exitFullscreenByEsc?: boolean
		fullscreenZIndex?: number
		koefAdjustment?: number
		suppressObsoleteBrowserNotifier?: boolean
	}

	// Placemark
	class Placemark {
		constructor(
			geometry: number[] | object,
			properties?: PlacemarkProperties,
			options?: PlacemarkOptions
		)

		events: EventManager
		geometry: Geometry
		properties: DataManager
		options: OptionManager
		balloon: Balloon
		hint: Hint

		getOverlay(): Promise<IOverlay>
		getOverlaySync(): IOverlay | null
	}

	interface PlacemarkProperties {
		balloonContent?: string
		balloonContentHeader?: string
		balloonContentBody?: string
		balloonContentFooter?: string
		hintContent?: string
		iconContent?: string
		iconCaption?: string
	}

	interface PlacemarkOptions {
		preset?: string
		iconColor?: string
		iconImageHref?: string
		iconImageSize?: number[]
		iconImageOffset?: number[]
		iconShape?: object
		iconLayout?: string | ((...args: unknown[]) => unknown)
		iconContentLayout?: string | ((...args: unknown[]) => unknown)
		iconCaptionMaxWidth?: number
		balloonCloseButton?: boolean
		balloonMaxWidth?: number
		balloonMinHeight?: number
		balloonMinWidth?: number
		balloonOffset?: number[]
		balloonPane?: string
		balloonShadow?: boolean
		balloonShadowOffset?: number[]
		balloonShadowSize?: number[]
		hideIconOnBalloonOpen?: boolean
		openBalloonOnClick?: boolean
		openEmptyBalloon?: boolean
		openEmptyHint?: boolean
		openHintOnHover?: boolean
		draggable?: boolean
		cursor?: string
		strokeColor?: string
		strokeOpacity?: number
		strokeWidth?: number
		fillColor?: string
		fillOpacity?: number
		fillImageHref?: string
		visible?: boolean
		zIndex?: number
		zIndexActive?: number
		zIndexDrag?: number
		zIndexHover?: number
	}

	// Collections and Managers
	class GeoObjectCollection {
		add(object: Placemark | unknown): GeoObjectCollection
		remove(object: Placemark | unknown): GeoObjectCollection
		removeAll(): GeoObjectCollection
		getIterator(): Iterator
		getLength(): number
		getBounds(): number[][] | null

		events: EventManager
		options: OptionManager
		properties: DataManager
	}

	class ControlCollection {
		add(control: string | unknown, options?: object): ControlCollection
		remove(control: string | unknown): ControlCollection
		get(index: number | string): object | null
		getIterator(): Iterator
		getLength(): number
	}

	class EventManager {
		add(
			event: string,
			handler: (...args: unknown[]) => unknown,
			context?: object,
			priority?: number
		): EventManager
		remove(
			event: string,
			handler: (...args: unknown[]) => unknown,
			context?: object,
			priority?: number
		): EventManager
		fire(event: string, eventObject?: object | Event): EventManager
		createEventObject(type: string, event: object, target: object): Event
	}

	class BehaviorManager {
		get(name: string): object | null
		isEnabled(name: string): boolean
		enable(name: string | string[]): BehaviorManager
		disable(name: string | string[]): BehaviorManager
	}

	// Data and Option Managers
	class DataManager {
		get(property: string, defaultValue?: unknown): unknown
		set(property: string | object, value?: unknown): DataManager
		unset(property: string): DataManager
		setAll(): DataManager
		getAll(): object
	}

	class OptionManager {
		get(option: string, defaultValue?: unknown): unknown
		set(option: string | object, value?: unknown): OptionManager
		unset(option: string): OptionManager
		setAll(): OptionManager
		getAll(): object
		getParent(): OptionManager | null
		setParent(parent: OptionManager): OptionManager
	}

	// Geometry
	class Geometry {
		getCoordinates(): number[]
		setCoordinates(coordinates: number[]): void
		getBounds(): number[][] | null
		getType(): string
	}

	// Balloon and Hint
	class Balloon {
		autoPan(): Promise<Balloon>
		close(force?: boolean): Promise<Balloon>
		destroy(): void
		getData(): object | null
		getOptions(): OptionManager | null
		getOverlay(): Promise<IOverlay | null>
		getOverlaySync(): IOverlay | null
		getPosition(): number[] | null
		isOpen(): boolean
		open(
			objectId?: object | string,
			anchorPixelPosition?: boolean
		): Promise<Balloon>
		setData(data: object | string | HTMLElement): Promise<Balloon>
		setOptions(options: object): Promise<Balloon>
		setPosition(position: number[]): Promise<Balloon>
	}

	class Hint {
		destroy(): void
		getData(): object | null
		getOptions(): OptionManager | null
		getOverlay(): Promise<IOverlay | null>
		getOverlaySync(): IOverlay | null
		getPosition(): number[] | null
		isOpen(): boolean
		open(
			objectId?: object | string,
			anchorPixelPosition?: boolean
		): Promise<Hint>
		setData(data: object | string | HTMLElement): Promise<Hint>
		setOptions(options: object): Promise<Hint>
		setPosition(position: number[]): Promise<Hint>
	}

	// Geocoder
	function geocode(
		request: string,
		options?: GeocodeOptions
	): Promise<GeocodeResult>

	interface GeocodeOptions {
		boundedBy?: number[][]
		strictBounds?: boolean
		results?: number
		skip?: number
		lang?: string
		rspn?: number
		ll?: string
		spn?: string
		bbox?: string
		rstr?: string
		uri?: string
	}

	interface GeocodeResult {
		geoObjects: GeoObjectCollection
		metaData: {
			geocoder: {
				request: string
				found: string
				results: string
				skip: string
			}
		}
	}

	// Controls
	namespace control {
		class FullscreenControl {
			constructor(parameters?: object)
			events: EventManager
			options: OptionManager
			data: DataManager
		}

		class GeolocationControl {
			constructor(parameters?: object)
			events: EventManager
			options: OptionManager
			data: DataManager
		}

		class ZoomControl {
			constructor(parameters?: object)
			events: EventManager
			options: OptionManager
			data: DataManager
		}

		class TypeSelector {
			constructor(parameters?: object)
			events: EventManager
			options: OptionManager
			data: DataManager
		}

		class SearchControl {
			constructor(parameters?: object)
			events: EventManager
			options: OptionManager
			data: DataManager
			getRequestString(): string
			getResponseMetaData(): object
			getResultsArray(): object[]
			getSelectedIndex(): number
			hideResult(): SearchControl
			showResult(index: number): SearchControl
			search(request: string): Promise<void>
		}

		class TrafficControl {
			constructor(parameters?: object)
			events: EventManager
			options: OptionManager
			data: DataManager
			getProvider(): object
			setProvider(provider: string | object): TrafficControl
		}
	}

	// Template Layout Factory
	namespace templateLayoutFactory {
		function createClass(
			template: string,
			overrides?: object,
			staticMethods?: object
		): (...args: unknown[]) => unknown
	}

	// Utilities
	namespace util {
		namespace pixelGeometry {
			class Rectangle {
				constructor(coordinates: number[][], fillRule?: string)
				contains(position: number[]): boolean
				equals(geometry: unknown): boolean
				getBounds(): number[][] | null
				getCoordinates(): number[][]
				getLength(): number
				getType(): string
				scale(factor: number): Rectangle
				shift(offset: number[]): Rectangle
			}

			class Polygon {
				constructor(coordinates: number[][][], fillRule?: string)
				contains(position: number[]): boolean
				equals(geometry: unknown): boolean
				getBounds(): number[][] | null
				getCoordinates(): number[][][]
				getLength(): number
				getType(): string
				scale(factor: number): Polygon
				shift(offset: number[]): Polygon
			}
		}

		namespace coordSystem {
			function geo(coordinates: number[], zoom?: number): object
			function pixels(coordinates: number[]): object
		}
	}

	// Interfaces
	interface IOverlay {
		getElement(): HTMLElement
		getGeometry(): object
		getData(): object
		getOptions(): object
		setData(data: object): void
		setOptions(options: object): void
	}

	interface Iterator {
		getNext(): object | null
	}

	interface Event {
		allowMapEvent(): void
		callMethod(name: string): unknown
		get(name: string): unknown
		getSourceEvent(): Event | null
		isDefaultPrevented(): boolean
		isImmediatePropagationStopped(): boolean
		isPropagationStopped(): boolean
		preventDefault(): void
		stopImmediatePropagation(): void
		stopPropagation(): void
	}

	// Ready function
	const ready: Promise<void>
}

// Extend window interface for other global objects
declare global {
	interface Window {
		// Google Analytics
		dataLayer: unknown[]

		// File System API (for reading uploaded files)
		fs?: {
			readFile: (
				path: string,
				options?: { encoding?: string }
			) => Promise<Uint8Array | string>
		}
	}
}

export {}

// src/types/yandex-maps.d.ts - Enhanced and typed, no explicit any

declare global {
	interface Window {
		ymaps: YMaps
	}
}

interface YMaps {
	ready(callback?: () => void): Promise<void>

	Map: {
		new (
			container: string | HTMLElement,
			state: YMapState,
			options?: YMapOptions
		): YMap
	}

	Placemark: {
		new (
			geometry: number[],
			properties?: YPlacemarkProperties,
			options?: YPlacemarkOptions
		): YPlacemark
	}

	control: {
		FullscreenControl: {
			new (parameters?: object): YControl
		}
		ZoomControl: {
			new (parameters?: object): YControl
		}
		TypeSelector: {
			new (parameters?: object): YControl
		}
		GeolocationControl: {
			new (parameters?: object): YControl
		}
		RouteButtonControl: {
			new (parameters?: object): YControl
		}
		TrafficControl: {
			new (parameters?: object): YControl
		}
	}

	geocode(request: string, options?: YGeocodeOptions): Promise<YGeocodeResult>
}

interface YMapState {
	center: number[]
	zoom: number
	controls?: string[]
	type?: string
	behaviors?: string[]
}

interface YMapOptions {
	minZoom?: number
	maxZoom?: number
	restrictMapArea?: boolean | number[][]
	suppressMapOpenBlock?: boolean
	yandexMapDisablePoiInteractivity?: boolean
	searchControlProvider?: string
	autoFitToViewport?: string
	avoidFractionalZoom?: boolean
	exitFullscreenByEsc?: boolean
	fullscreenZIndex?: number
}

interface YMap {
	geoObjects: YGeoObjectCollection
	controls: YControlCollection
	events: YEventManager
	behaviors: YBehaviorManager

	getCenter(): number[]
	getZoom(): number
	getBounds(): number[][]
	setCenter(center: number[], zoom?: number, options?: object): Promise<void>
	setZoom(zoom: number, options?: object): Promise<void>
	setBounds(bounds: number[][], options?: object): Promise<void>
	destroy(): void
	getContainer(): HTMLElement
}

interface YPlacemarkProperties {
	balloonContent?: string
	balloonContentHeader?: string
	balloonContentBody?: string
	balloonContentFooter?: string
	hintContent?: string
	iconContent?: string
	iconCaption?: string
}

interface YPlacemarkOptions {
	preset?: string
	iconColor?: string
	iconImageHref?: string
	iconImageSize?: number[]
	iconImageOffset?: number[]
	iconCaptionMaxWidth?: number
	balloonCloseButton?: boolean
	balloonMaxWidth?: number
	balloonMinHeight?: number
	balloonMinWidth?: number
	balloonOffset?: number[]
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
	visible?: boolean
	zIndex?: number
	zIndexActive?: number
	zIndexDrag?: number
	zIndexHover?: number
}

interface YPlacemark {
	events: YEventManager
	geometry: YGeometry
	properties: YDataManager
	options: YOptionManager
	balloon: YBalloon
	hint: YHint

	getOverlay(): Promise<unknown>
	getOverlaySync(): unknown | null
}

interface YGeoObjectCollection {
	add(object: YPlacemark | unknown): YGeoObjectCollection
	remove(object: YPlacemark | unknown): YGeoObjectCollection
	removeAll(): YGeoObjectCollection
	getLength(): number
	getBounds(): number[][] | null
	getIterator(): YIterator
}

interface YControlCollection {
	add(control: string | unknown, options?: object): YControlCollection
	remove(control: string | unknown): YControlCollection
	get(index: number | string): unknown | null
}

interface YControl {
	events: YEventManager
	options: YOptionManager
	data: YDataManager
}

interface YEventManager {
	add(
		event: string,
		handler: (...args: unknown[]) => unknown,
		context?: object,
		priority?: number
	): YEventManager
	remove(
		event: string,
		handler: (...args: unknown[]) => unknown,
		context?: object
	): YEventManager
	fire(event: string, eventObject?: object): YEventManager
}

interface YBehaviorManager {
	get(name: string): unknown
	isEnabled(name: string): boolean
	enable(name: string | string[]): YBehaviorManager
	disable(name: string | string[]): YBehaviorManager
}

interface YGeometry {
	getCoordinates(): number[]
	setCoordinates(coordinates: number[]): void
	getBounds(): number[][] | null
	getType(): string
}

interface YDataManager {
	get(property: string, defaultValue?: unknown): unknown
	set(property: string | object, value?: unknown): YDataManager
	unset(property: string): YDataManager
	setAll(data?: unknown): YDataManager
	getAll(): unknown
}

interface YOptionManager {
	get(option: string, defaultValue?: unknown): unknown
	set(option: string | object, value?: unknown): YOptionManager
	unset(option: string): YOptionManager
	setAll(options?: unknown): YOptionManager
	getAll(): unknown
	getParent(): YOptionManager | null
	setParent(parent: YOptionManager): YOptionManager
}

interface YBalloon {
	autoPan(): Promise<YBalloon>
	close(force?: boolean): Promise<YBalloon>
	destroy(): void
	getData(): unknown
	getOptions(): YOptionManager | null
	getOverlay(): Promise<unknown>
	getOverlaySync(): unknown | null
	getPosition(): number[] | null
	isOpen(): boolean
	open(objectId?: unknown, anchorPixelPosition?: boolean): Promise<YBalloon>
	setData(data: unknown): Promise<YBalloon>
	setOptions(options: unknown): Promise<YBalloon>
	setPosition(position: number[]): Promise<YBalloon>
}

interface YHint {
	destroy(): void
	getData(): unknown
	getOptions(): YOptionManager | null
	getOverlay(): Promise<unknown>
	getOverlaySync(): unknown | null
	getPosition(): number[] | null
	isOpen(): boolean
	open(objectId?: unknown, anchorPixelPosition?: boolean): Promise<YHint>
	setData(data: unknown): Promise<YHint>
	setOptions(options: unknown): Promise<YHint>
	setPosition(position: number[]): Promise<YHint>
}

interface YGeocodeOptions {
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

interface YGeocodeResult {
	geoObjects: YGeoObjectCollection
	metaData: {
		geocoder: {
			request: string
			found: string
			results: string
			skip: string
		}
	}
}

interface YIterator {
	getNext(): unknown | null
}

// Export for module usage
export {}

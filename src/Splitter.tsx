import './splitter.css';

import React, {Children, CSSProperties, ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {Runner} from './Runner';
import {Pane} from './Pane';

const MIN_SIZE = 10;

export type MODE = 'vertical' | 'horizontal';

export interface SplitterProps {
	children: ReactNode | ReactNode[];
	initialSizes?: number[];
	minSizes?: number | number[];
	maxSizes?: number | number[];
	runnerSize?: number | string;
	onResize?: (sizesInUnits: number[], sizes: number[]) => void;
	onDragStart?: (event: MouseEvent, indexes: number[]) => void;
	onDragEnd?: (event: MouseEvent, indexes: number[]) => void;
	resizable?: boolean | boolean[];
	discrete?: boolean | number;
	actionOnContainerResize?: boolean;
	mode?: MODE;
	runnerStyle?: CSSProperties,
	runnerClassName?: string,
	splitterStyle?: CSSProperties,
	splitterClassName?: string,
	paneClassName?: string,
}

export interface RectParams {
	offset: 'left' | 'top';
	size: 'width' | 'height';
	axis: 'clientX' | 'clientY'
}

export const Splitter = (props: SplitterProps) => {
	const refContainer = useRef<HTMLDivElement | null>(null);
	const paneRefs = useRef<HTMLDivElement[]>([]);
	const runnerRefs = useRef<HTMLDivElement[]>([]);
	const [sizes, setSizes] = useState<number[]>([]);
	const {
		children,
		onResize,
		onDragStart,
		onDragEnd,
		resizable = true,
		discrete = false,
		mode = 'horizontal',
		actionOnContainerResize = false,
		runnerSize = 6,
		runnerStyle,
		paneClassName,
		splitterClassName,
		splitterStyle
	} = props;

	const childrenCount = Children.count(children);

	const initialSizes = useMemo(() => {
		if (props.initialSizes) {
			return  props.initialSizes;
		} else {
			let sum = 0;
			const unit = 100 / childrenCount;
			const res =  Array(childrenCount).fill(1).map((value, ind, arr) => {
				if (ind === arr.length - 1) {
					return 100 - sum;
				}
				sum += unit;
				return unit;
			});
			return res;
		}
	}, [props.initialSizes]);



	const fullSizeInUnits = initialSizes.reduce((acc, cur) => acc + cur, 0);

	const modeParams = useMemo<RectParams>(() => {
		const res: RectParams = {
			offset: 'left',
			size: 'width',
			axis: 'clientX',
		};
		if (mode === 'vertical') {
			res.offset = 'top';
			res.size = 'height';
			res.axis = 'clientY';
		}
		return res;
	}, [mode]);

	useEffect(() => {
		let observer: ResizeObserver;
		if (refContainer.current) {
			const observerCallback: ResizeObserverCallback = (entries) => {
				const currentContainerSize = entries[0].contentRect[modeParams.size];
				setSizes((prevSizes) => {
					const fullPrevSize = prevSizes.reduce((acc, cur) => acc + cur, 0);
					let offset = 0;
					const units: number[] = [];
					const res = prevSizes.map((prevSize, ind) => {
						const size = (prevSize * currentContainerSize) / fullPrevSize;
						units.push(prevSize * fullSizeInUnits / fullPrevSize);
						const runner = runnerRefs.current[ind - 1];
						if (runner) {
							const shift = runner.getBoundingClientRect()[modeParams.size] / 2;
							runner.style[modeParams.offset] = `${offset - shift}px`;
						}
						if (ind < prevSizes.length - 1) offset += size;
						return size;
					});
					if (actionOnContainerResize && onResize) onResize(units, res);
					return res;
				});
			};
			observer = new ResizeObserver(observerCallback);
			observer.observe(refContainer.current, {
				box: 'border-box',
			});
		}
		return () => observer?.disconnect();
	}, []);

	useEffect(() => {
		if (refContainer.current) {
			const containerWidth = refContainer.current?.getBoundingClientRect()[modeParams.size];
			const curSizes = initialSizes.map((initialSize, ind) => {
				const rate = containerWidth / fullSizeInUnits;
				return rate * initialSize;
			});
			setSizes(curSizes);
		}
	}, [initialSizes]);

	const content = useMemo(() => {
		const res: ReactNode[] = [];
		const minSizesPx: number[] = [];
		const maxSizesPx: number[] = [];

		const minSizes = typeof props.minSizes === 'number' ? Array(childrenCount).fill(props.minSizes) : props.minSizes;
		const maxSizes = typeof props.maxSizes === 'number' ? Array(childrenCount).fill(props.maxSizes) : props.maxSizes;

		Children.forEach(children, (child, ind) => {
			const rate = initialSizes[ind] / fullSizeInUnits;
			const containerWidth = refContainer.current?.getBoundingClientRect()?.[modeParams.size];
			const minSizePx = containerWidth && minSizes?.[ind] != null ? (minSizes[ind] * containerWidth) / fullSizeInUnits : MIN_SIZE;
			const maxSizePx = containerWidth && maxSizes?.[ind] != null ? (maxSizes[ind] * containerWidth) / fullSizeInUnits : Number.MAX_VALUE;
			minSizesPx.push(minSizePx);
			maxSizesPx.push(maxSizePx);
			res.push(
				<Pane
					size={sizes?.[ind] ? sizes[ind] : `${rate * 100}%`}
					minSize={minSizePx}
					maxSize={maxSizePx}
					paneRefs={paneRefs}
					key={`sp_${ind}`}
					mode={mode}
					index={ind}
					className={paneClassName}
				>
					{child}
				</Pane>
			);

			if (sizes.length > 0 && ind > 0) {
				const lastPaneBeginsAt = sizes.slice(0, ind - 1).reduce((acc, cur) => acc + cur, 0);
				const lastPaneEndsAt = sizes.slice(0, ind).reduce((acc, cur) => acc + cur, 0);
				const currentPaneEndsAt = lastPaneEndsAt + sizes[ind];
				const minBorder = Math.max(lastPaneBeginsAt + minSizesPx[ind - 1], currentPaneEndsAt - maxSizesPx[ind]);
				const maxBorder = Math.min(lastPaneBeginsAt + maxSizesPx[ind - 1], currentPaneEndsAt - minSizesPx[ind]);

				const runnerResizable = Array.isArray(resizable) ? (resizable[ind - 1] && resizable[ind]) : resizable;
				let style: CSSProperties = {
					display: runnerResizable ? 'block' : 'none'
				};

				let runnerClassName: string;

				if (mode === 'horizontal') {
					style.width = runnerSize;
					runnerClassName = `runner-horizontal`;
				} else {
					style.width = '100%';
					style.height = runnerSize;
					runnerClassName = 'runner-vertical';
				}

				res.push(
					<Runner
						setSizes={setSizes}
						key={`r_${ind}`}
						startAt={sizes.slice(0, ind).reduce((acc, cur) => acc + cur, 0)}
						pairIndex={[ind - 1, ind]}
						onDragStart={onDragStart}
						onDragEnd={onDragEnd}
						paneRefs={paneRefs}
						minBorder={minBorder}
						maxBorder={maxBorder}
						refContainer={refContainer}
						onResize={onResize}
						fullSizeInUnits={fullSizeInUnits}
						runnerRefs={runnerRefs}
						discrete={discrete}
						modeParams={modeParams}
						style={{
							...style,
							...runnerStyle
						}}
						className={`${runnerClassName} ${props.runnerClassName ? props.runnerClassName : ''}`}
					/>
				);
			}
		});
		return res;
	}, [children, fullSizeInUnits, props.maxSizes, props.minSizes, sizes, initialSizes]);

	return (
		<div
			className={`splitter-container ${splitterClassName ? splitterClassName : ''}`}
			ref={refContainer}
			style={{
				flexDirection: mode === 'horizontal' ? 'row' : 'column',
				[modeParams.size]: '100%',
				...splitterStyle
			}}>
			{content}
		</div>
	);
};
import React, {MutableRefObject, ReactNode, useEffect, useRef} from 'react';
import {MODE} from './Splitter';

export interface PaneProps {
	children: ReactNode | ReactNode[];
	size: number | string;
	minSize: number;
	maxSize: number;
	index: number;
	paneRefs: MutableRefObject<HTMLDivElement[]>;
	className?: string;
	mode?: MODE;
}

export const Pane = (props: PaneProps) => {
	const {children, size, minSize, maxSize, index, paneRefs, mode, className} = props;
	const paneRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (paneRef.current) {
			paneRefs.current[index] = paneRef.current;
		}
	}, []);

	return (
		<div
			className={`pane-container ${className ? className : ''}`}
			ref={paneRef}
			style={{
				flexBasis: size,
				[mode === 'horizontal' ? 'minWidth' : 'minHeight']: minSize,
				[mode === 'horizontal' ? 'maxWidth' : 'maxHeight']: maxSize
			}}
		>
			{children}
		</div>
	);
};

Pane.displayName = 'Pane';

const path = require('path');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
	entry: './src/index.tsx',
	mode,
	devtool: mode === 'development' && "source-map",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{ test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] }
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.css', '...'],
	},
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
		library: 'ReactSplitterLight',
		libraryTarget: 'umd',
		clean: true,
	},
	externals: {
		'react': {
			'commonjs': 'react',
			'commonjs2': 'react',
			'amd': 'react',
			'root': 'React'
		},
		'react-dom': {
			'commonjs': 'react-dom',
			'commonjs2': 'react-dom',
			'amd': 'react-dom',
			'root': 'ReactDOM'
		}
	},
};

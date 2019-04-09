import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
	Text,
	View,
	Image,
	Animated,
	ScrollView
} from 'react-native';

import { USER, FACEBOOK_LIST, SLACK_LIST, GENERIC_LIST, SCREEN_WIDTH, SCREEN_HEIGHT, DEFAULT_WINDOW_MULTIPLIER, DEFAULT_NAVBAR_HEIGHT } from './constants';

import styles from './styles';

const ScrollViewPropTypes = ScrollView.propTypes;

export default class ParallaxScrollView extends Component {
	constructor() {
		super();

		this.state = {
			scrollY: new Animated.Value(0)
		};
	}

	scrollTo(where) {
		if (!this._scrollView) return;
		this._scrollView.scrollTo(where);
	}

	renderBackground() {
		var { windowHeight, backgroundSource } = this.props;
		var { scrollY } = this.state;
		if (!windowHeight || !backgroundSource) {
			return null;
		}

		return (
			<Animated.Image
				style={[
					styles.background,
					{
						height: windowHeight,
						transform: [
							{
								translateY: scrollY.interpolate({
									inputRange: [-windowHeight, 0, windowHeight],
									outputRange: [windowHeight / 2, 0, -windowHeight / 3]
								})
							},
							{
								scale: scrollY.interpolate({
									inputRange: [-windowHeight, 0, windowHeight],
									outputRange: [2, 1, 1]
								})
							}
						]
					}
				]}
				source={backgroundSource}
			>
			</Animated.Image>
		);
	}

	renderHeaderView() {
		const { windowHeight, backgroundSource, userImage, userName, userTitle, navBarHeight } = this.props;
		const { scrollY } = this.state;
		if (!windowHeight || !backgroundSource) {
			return null;
		}

		const newNavBarHeight = navBarHeight || DEFAULT_NAVBAR_HEIGHT;
		const newWindowHeight = windowHeight - newNavBarHeight;

		return (
			<Animated.View
				style={{
					opacity: scrollY.interpolate({
						inputRange: [-windowHeight, 0, windowHeight * DEFAULT_WINDOW_MULTIPLIER + newNavBarHeight],
						outputRange: [1, 1, 0]
					})
				}}
			>
				<View style={{ height: newWindowHeight}}>
					{this.props.headerView ||
						(
							<View>
								<View
									style={styles.avatarView}
								>
									<Image source={{ uri: userImage || USER.image }} style={{ height: 120, width: 120, borderRadius: 60 }} />
								</View>
								<View style={{ paddingVertical: 10 }}>
									<Text style={{ textAlign: 'center', fontSize: 22, color: 'white', paddingBottom: 5 }}>{userName || USER.name}</Text>
									<Text style={{ textAlign: 'center', fontSize: 17, color: 'rgba(247,247, 250, 1)', paddingBottom: 5 }}>{userTitle || USER.title}</Text>
								</View>
							</View>
						)
					}
				</View>
			</Animated.View>
		);
	}

	renderNavBarTitle() {
		const { windowHeight, backgroundSource, navBarTitleColor, navBarTitleComponent } = this.props;
		const { scrollY } = this.state;
		if (!windowHeight || !backgroundSource) {
			return null;
		}

		return (
			<Animated.View
				style={{
					opacity: scrollY.interpolate({
						inputRange: [-windowHeight, windowHeight * DEFAULT_WINDOW_MULTIPLIER, windowHeight * 0.8],
						outputRange: [0, 0, 1]
					}),
					flex:1,
				}}
			>
				{navBarTitleComponent}
			</Animated.View>
		);
	}

	rendernavBar() {
		const {
			windowHeight, backgroundSource, leftIcon,
			rightIcon, leftIconOnPress, rightIconOnPress, navBarColor, navBarHeight, leftIconUnderlayColor, rightIconUnderlayColor
		} = this.props;
		const { scrollY } = this.state;
		if (!windowHeight || !backgroundSource) {
			return null;
		}

		const newNavBarHeight = navBarHeight || DEFAULT_NAVBAR_HEIGHT;

		if (this.props.navBarView) {
			return (
				<Animated.View
					style={{
						height: newNavBarHeight,
						width: SCREEN_WIDTH,
						flexDirection: 'row',
						backgroundColor: scrollY.interpolate({
							inputRange: [-windowHeight, windowHeight * DEFAULT_WINDOW_MULTIPLIER, windowHeight * 0.8],
							outputRange: ['transparent', 'transparent', navBarColor || 'rgba(0, 0, 0, 1.0)'],
							extrapolate: 'clamp'
						})
					}}
				>
					{this.props.navBarView}
				</Animated.View>
			);
		}
		else {
			return (
				<Animated.View
					style={{
						height: newNavBarHeight,
						width: SCREEN_WIDTH,
						zIndex: 10,
						backgroundColor: scrollY.interpolate({
							inputRange: [-windowHeight, windowHeight * DEFAULT_WINDOW_MULTIPLIER, windowHeight * 0.8],
							outputRange: ['transparent', 'transparent', navBarColor || 'rgba(0, 0, 0, 1.0)']
						})
					}}
				>
					<Animated.View 
						style={{
							position:'absolute',
							top:0,
							left:0,
							right:0,
							opacity: scrollY.interpolate({
								inputRange: [-windowHeight, windowHeight * DEFAULT_WINDOW_MULTIPLIER, windowHeight * 0.8],
								outputRange: [1, 1, 0]
							})
						}}>
						{this.props.stackHeader}
					</Animated.View>
					<View
						style={{
							flex: 1,
						}}
					>
						{this.renderNavBarTitle()}
					</View>
				</Animated.View>
			);
		}
	}
	render() {
		const { style, mask, maskColor, ...props } = this.props;

		return (
			<View style={[styles.container, style]}>
				<View>
					{this.renderBackground()}
					{
						mask ? <View 
							style={[styles.mask,{
								backgroundColor: maskColor,
							}]}
						/> : null
					}
				</View>
				{this.rendernavBar()}
				<ScrollView
					ref={component => {
						this._scrollView = component;
					}}
					{...props}
					style={styles.scrollView}
					onScroll={Animated.event([
						{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }
					])}
					scrollEventThrottle={16}
				>
					{this.renderHeaderView()}
					<View style={[styles.content, props.scrollableViewStyle]}>
						{this.props.children}
					</View>
				</ScrollView>
			</View>
		);
	}
}

ParallaxScrollView.defaultProps = {
	backgroundSource: { uri: 'http://i.imgur.com/6Iej2c3.png' },
	windowHeight: SCREEN_HEIGHT * DEFAULT_WINDOW_MULTIPLIER,
	leftIconOnPress: () => console.log('Left icon pressed'),
	rightIconOnPress: () => console.log('Right icon pressed'),
	mask: false,
	maskColor: 'rgba(53,82,138,.9)',
};

ParallaxScrollView.propTypes = {
	...ScrollViewPropTypes,
	backgroundSource: PropTypes.any,
	windowHeight: PropTypes.number,
	navBarTitle: PropTypes.string,
	navBarTitleColor: PropTypes.string,
	navBarTitleComponent: PropTypes.node,
	navBarColor: PropTypes.string,
	userImage: PropTypes.string,
	userName: PropTypes.string,
	userTitle: PropTypes.string,
	headerView: PropTypes.node,
	leftIcon: PropTypes.object,
	rightIcon: PropTypes.object,
	mask: PropTypes.bool,
	maskColor: PropTypes.string,
};

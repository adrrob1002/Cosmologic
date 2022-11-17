import Roact from "@rbxts/roact";
import { App } from "client/controllers/app-controller";
import { Scene } from "types/enum/scene";

interface IStateProps {
	money: number;
}

interface IDispatchProps {}

interface IProps extends IStateProps, IDispatchProps {}

@App({
	name: "CurrencyApp",
	requiredScenes: [Scene.World],
	ignoreGuiInset: true,
	mapStateToProps: (state) => {
		return identity<IStateProps>({
			money: state.playerData.money,
		});
	},
})
export class World extends Roact.PureComponent<IProps> {
	render() {
		return (
			<textlabel
				AnchorPoint={new Vector2(0.5, 0)}
				Position={new UDim2(0.5, 0, 0, 0)}
				Size={new UDim2(1, 0, 0, 40)}
				BackgroundColor3={Color3.fromRGB(15, 15, 15)}
				BorderSizePixel={0}
				Text={`$${tostring(this.props.money)}`}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				Font={Enum.Font.SourceSansBold}
				TextSize={16}
			/>
		);
	}
}

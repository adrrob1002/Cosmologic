const getRotationBetween = (u: Vector3, v: Vector3, axis: Vector3): CFrame => {
	const dot = u.Dot(v);
	const uxv = u.Cross(v);
	if (dot < -0.99999) return CFrame.fromAxisAngle(axis, math.pi);
	return new CFrame(0, 0, 0, uxv.X, uxv.Y, uxv.Z, 1 + dot);
};

export const setupAuthMocks = () => {
  // utils/user.util.ts mock
  jest.doMock("../../utils/user.util", () => ({
    setUser: (req: any, payload: any) => {
      req.user = payload;
    },
    isUserAdmin: (payload: any) => {
      return payload?.role === "ADMIN" || payload?.role === "SUPER_ADMIN";
    },
    isUserSuperAdmin: (payload: any) => {
      return payload?.role === "SUPER_ADMIN";
    },
  }));

  // utils/token.util.ts mock
  jest.doMock("../../utils/token.util", () => ({
    generateAccessToken: (payload: any) => {
      return Buffer.from(JSON.stringify(payload)).toString("base64");
    },
    getAccessToken: (req: any) => {
      const cookie = req.cookies?.["access-token"];
      return cookie;
    },
    verifyAccessToken: (token: string) => {
      try {
        const decoded = JSON.parse(Buffer.from(token, "base64").toString());
        return decoded;
      } catch {
        throw new Error("Invalid token");
      }
    },
  }));

  // types/error.type.ts 실제 에러 클래스 사용
  const { UnauthorizedError, ForbiddenError } = jest.requireActual(
    "../../types/error.type"
  );

  // middlewares/allow.middleware.ts mock
  jest.doMock("../../middlewares/allow.middleware", () => ({
    AllowedRole: {
      USER: "USER",
      ADMIN: "ADMIN",
      SUPER_ADMIN: "SUPER_ADMIN",
      NONE: "NONE",
    },
    allow: (role: string) => {
      return async (req: any, _res: any, next: any) => {
        try {
          const token = req.cookies?.["access-token"];

          if (!token && role !== "NONE") {
            const error = new UnauthorizedError();
            return next(error);
          }

          if (token) {
            const decoded = JSON.parse(Buffer.from(token, "base64").toString());
            req.user = decoded;

            // 권한 검사
            if (role === "ADMIN") {
              if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
                const error = new ForbiddenError();
                return next(error);
              }
            } else if (role === "SUPER_ADMIN") {
              if (decoded.role !== "SUPER_ADMIN") {
                const error = new ForbiddenError();
                return next(error);
              }
            }
          }

          next();
        } catch (err) {
          const error = new UnauthorizedError();
          next(error);
        }
      };
    },
  }));
};

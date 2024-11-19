module.exports = (plugin) => {
    // Endpoint personalizado para obtener información del usuario actual
    plugin.controllers.user.getMe = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {
            ctx.response.status = 401;
            return (ctx.response.body = { error: "Unauthorized" });
        }

        try {
            // Obtener el usuario actual con su rol
            const user = await strapi.query('plugin::users-permissions.user').findOne({
                where: { id: ctx.state.user.id },
                populate: ['role'], // Asegúrate de incluir el role en la consulta
            });

            if (!user) {
                ctx.response.status = 404;
                return (ctx.response.body = { error: "User not found" });
            }

            // Devuelve los datos del usuario excluyendo información sensible
            const { password, resetPasswordToken, confirmationToken, ...safeUserData } = user;
            ctx.response.status = 200;
            ctx.response.body = safeUserData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            ctx.response.status = 500;
            ctx.response.body = { error: "Internal server error" };
        }
    };

    // Agregar la ruta personalizada al plugin
    plugin.routes['content-api'].routes.push(
        {
            method: "GET",
            path: "/user/me",
            handler: "user.getMe",
            config: {
                prefix: "",
                policies: []
            }
        }
    );

    return plugin;
};
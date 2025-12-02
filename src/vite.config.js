import { defineConfig } from 'vite'
import path from 'path';

const projectRoot = path.join(process.cwd(), "src");
const publicLocation = path.resolve(projectRoot, "..", "public");
const disLocation = path.resolve(projectRoot, "..", "dist");

export default defineConfig({
    root: projectRoot,
    publicDir: publicLocation,
    envDir: "../",
    build: {
        rollupOptions: {
            input: {
                index: path.join(projectRoot, "index.html"),
                login: path.join(projectRoot, "loginpage.html"),
                signup: path.join(projectRoot, "signuppage.html"),
                sofiascalendar: path.join(projectRoot, "sofiascalendar.html"),
                friends: path.join(projectRoot, "friends.html"),
                sofiassettings: path.join(projectRoot, "sofiassettings.html"),
                groupweeklyview: path.join(projectRoot, "groupweeklyview.html"),
                sofiasnewedit: path.join(projectRoot, "sofiasnewedit.html"),
                sofiasnewgroupedit: path.join(projectRoot, "sofiasnewgroupedit.html"),
                sofiasnewweeklyview: path.join(projectRoot, "sofiasnewweeklyview.html"),
                groups: path.join(projectRoot, "groups.html")
            }
        },
        outDir: "../dist"
    }
});

import { defineConfig } from 'vite'
import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src/");
const publicLocation = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "public");

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

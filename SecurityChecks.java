import android.os.Build;
import android.util.Log;
 
import java.io.File;
 
public class SecurityChecks {
 
    private static final String TAG = "SecurityChecks";
 
    // Root binaries
    private static final String[] BINARY_PATHS = {
            "/sbin/su", "/system/bin/su", "/system/xbin/su",
            "/data/local/su", "/data/local/bin/su", "/data/local/xbin/su",
            "/system/app/Superuser.apk", "/system/app/SuperSU.apk",
            "/system/etc/init.d/99SuperSUDaemon", "/system/xbin/daemonsu",
            "/dev/com.koushikdutta.superuser.daemon/", "/cache/magisk.log",
            "/data/adb/magisk/", "/data/adb/magisk.db", "/data/adb/modules/",
            "/data/local/tmp/magisk/", "/data/data/com.topjohnwu.magisk/"
    };
 
    // Root packages
    private static final String[] ROOT_PACKAGES = {
            "com.topjohnwu.magisk", "eu.chainfire.supersu",
            "com.noshufou.android.su", "com.koushikdutta.superuser",
            "com.zachspong.temprootremovejb", "com.ramdroid.appquarantine",
            "com.devadvance.rootcloak", "de.robv.android.xposed.installer"
    };
 
    // Emulator properties
    private static final String[] EMULATOR_PROPERTIES = {
            "ro.kernel.qemu", "ro.hardware", "ro.product.model", "ro.product.manufacturer"
    };
 
    private static final String[] EMULATOR_FILES = {
            "/sys/qemu_trace", "/system/lib/libc_malloc_debug_qemu.so", "/system/bin/qemu-props"
    };
 
    public static boolean isDeviceRooted() {
        return checkRootBinaries() || checkRootPackages();
    }
 
    public static boolean isEmulator() {
        return checkBuildProperties() || checkEmulatorFiles();
    }
 
    private static boolean checkRootBinaries() {
        for (String path : BINARY_PATHS) {
            File file = new File(path);
            if (file.exists()) {
                Log.e(TAG, "Root binary found: " + path);
                return true;
            }
        }
        return false;
    }
 
    private static boolean checkRootPackages() {
        for (String packageName : ROOT_PACKAGES) {
            try {
                Runtime.getRuntime().exec("pm list packages " + packageName);
                Log.e(TAG, "Root package found: " + packageName);
                return true;
            } catch (Exception e) {
                // Package not found
            }
        }
        return false;
    }
 
    private static boolean checkBuildProperties() {
        for (String property : EMULATOR_PROPERTIES) {
            String value = getSystemProperty(property);
            if (value != null && isEmulatorProperty(value)) {
                Log.e(TAG, "Emulator property detected: " + property + " = " + value);
                return true;
            }
        }
        return false;
    }
 
    private static boolean checkEmulatorFiles() {
        for (String path : EMULATOR_FILES) {
            File file = new File(path);
            if (file.exists()) {
                Log.e(TAG, "Emulator file found: " + path);
                return true;
            }
        }
        return false;
    }
 
    private static String getSystemProperty(String key) {
        try {
            Process process = Runtime.getRuntime().exec("getprop " + key);
            byte[] output = new byte[1024];
            int readBytes = process.getInputStream().read(output);
            if (readBytes > 0) {
                return new String(output, 0, readBytes).trim();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error reading system property " + key, e);
        }
        return null;
    }
 
    private static boolean isEmulatorProperty(String value) {
        return value.toLowerCase().contains("sdk") || value.toLowerCase().contains("emulator")
                || value.toLowerCase().contains("genymotion") || value.toLowerCase().contains("goldfish");
    }

    public void doSomething() {
        System.out.println("I have executed");
    }
}

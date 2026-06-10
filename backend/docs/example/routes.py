import time

def user():
    return ("/user")

def contact():
    return ("/contact")

def ms():                        # ✅ no argument needed
    return time.time()           # just returns current time

def msCal(start):              # ✅ calculates the ms
    return round((time.time() - start) * 1000, 2)
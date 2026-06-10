from schema import 


# crud.py

def create(data):
    """Create new record"""
    return {
        "action": "CREATE",
        "data": data
    }


def read(data):
    """Read record"""
    return {
        "action": "READ",
        "data": data
    }


def update(data, updates):
    """Update record dynamically"""
    if isinstance(data, dict):
        data.update(updates)
        return {
            "action": "UPDATE",
            "data": data
        }

    # if object (class instance)
    for key, value in updates.items():
        setattr(data, key, value)

    return {
        "action": "UPDATE",
        "data": data
    }


def delete():
    """Delete record (simulate)"""
    return {
        "action": "DELETE",
        "data": None
    }
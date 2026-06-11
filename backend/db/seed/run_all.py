"""
Run all seeds: python db/seed/run_all.py
"""
from bank_kyc import run as seed_bank
from manpower_agency import run as seed_manpower
from unicritaria import run as seed_university

if __name__ == "__main__":
    seed_bank()
    seed_manpower()
    seed_university()

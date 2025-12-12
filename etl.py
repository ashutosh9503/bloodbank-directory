#!/usr/bin/env python3
# etl.py - map your BloodBanks_Merged.csv -> sql/inserts.sql with smart defaults

import os, sys
import pandas as pd

DEFAULT_INPUT = "BloodBanks_Merged.csv"

def sanitize_value(x):
    """Return SQL-safe representation (NULL or quoted escaped string)."""
    if pd.isna(x) or str(x).strip() == "":
        return "NULL"
    s = str(x).strip()
    s = s.replace("'", "''")   # escape single quotes for SQL
    return f"'{s}'"

def infer_has_blood_bank(name, category, typ):
    """Heuristic: search for keywords that imply presence of a blood bank."""
    text = " ".join([str(name or ""), str(category or ""), str(typ or "")]).lower()
    keywords = ["blood", "bloodbank", "blood bank", "bloodcentre", "blood centre", "transfusion", "blood centre", "blood bank"]
    for kw in keywords:
        if kw in text:
            return 1
    return 0

def make_public_id(sno_value, idx):
    """Create public_id from S.NO if present, otherwise fallback to index.
       Format: INSTxxxx where xxxx is zero-padded number."""
    try:
        # try integer conversion of S.NO
        n = int(float(str(sno_value).strip()))
    except Exception:
        n = idx + 1
    return f"INST{n:04d}"

def main():
    input_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
    if not os.path.isfile(input_file):
        print(f"ERROR: input file not found: {input_file}")
        print("Place the CSV in project root or call: py etl.py path/to/file.csv")
        sys.exit(1)

    print(f"Reading: {input_file}")
    # read all as strings to avoid dtype surprises
    df = pd.read_csv(input_file, dtype=str)

    cols = [c for c in df.columns]
    print("CSV columns detected:", cols)

    # required mappings for your CSV
    # Available columns (as you showed): S.NO, Name, Address, Phone, Email, Category, Type
    # Map them (case-insensitive)
    col_lookup = {c.lower().strip(): c for c in cols}

    def get_col(name_variants):
        for v in name_variants:
            key = v.lower()
            if key in col_lookup:
                return col_lookup[key]
        return None

    # expected candidates
    public_sno_col = get_col(["s.no", "s.no.", "sno", "s.no", "s. no", "s.no"])
    name_col       = get_col(["name", "inst_name", "institute", "hospital", "centre", "organization"])
    addr_col       = get_col(["address", "addr", "location", "place"])
    phone_col      = get_col(["phone", "phone no", "phone_number", "phone_no", "contact", "phone no"])
    email_col      = get_col(["email", "e-mail", "email_id", "email id"])
    category_col   = get_col(["category", "category"])
    type_col       = get_col(["type", "type"])

    # if mandatory columns missing, tell user and exit
    if not name_col or not addr_col:
        print("ERROR: Required columns missing. Found columns:", cols)
        print("Script needs Name and Address (or columns similar).")
        sys.exit(1)

    print("Mapping (inferred):")
    print("  public_sno_col:", public_sno_col)
    print("  name_col:", name_col)
    print("  addr_col:", addr_col)
    print("  phone_col:", phone_col)
    print("  email_col:", email_col)
    print("  category_col:", category_col)
    print("  type_col:", type_col)

    out_sql = []
    row_count = 0
    for idx, row in df.iterrows():
        # public_id
        public_id_raw = row.get(public_sno_col) if public_sno_col else None
        public_id = make_public_id(public_id_raw, idx)

        name_val = row.get(name_col, "")
        loc_val  = row.get(addr_col, "")

        # contact: join phone and email if present
        phone_val = row.get(phone_col, "")
        email_val = row.get(email_col, "")
        contact_parts = []
        if phone_val and str(phone_val).strip():
            contact_parts.append(str(phone_val).strip())
        if email_val and str(email_val).strip():
            contact_parts.append(str(email_val).strip())
        contact_val = " / ".join(contact_parts) if contact_parts else ""

        cat_val = row.get(category_col, "")
        type_val = row.get(type_col, "")

        # infer has_blood_bank
        hb_val = infer_has_blood_bank(name_val, cat_val, type_val)

        sql = (
            "INSERT INTO institutes (public_id, name, type, location, has_blood_bank, contact, status)\n"
            "VALUES (\n"
            f"  '{public_id}',\n"
            f"  {sanitize_value(name_val)},\n"
            f"  {sanitize_value(cat_val or type_val)},\n"
            f"  {sanitize_value(loc_val)},\n"
            f"  {hb_val},\n"
            f"  {sanitize_value(contact_val)},\n"
            "  'active'\n"
            ");\n"
        )
        out_sql.append(sql)
        row_count += 1

    # write to sql/inserts.sql
    os.makedirs("sql", exist_ok=True)
    outpath = os.path.join("sql", "inserts.sql")
    with open(outpath, "w", encoding="utf-8") as f:
        f.write("\n".join(out_sql))

    print(f"✔ Wrote {row_count} INSERT statements to {outpath}")

if __name__ == "__main__":
    main()

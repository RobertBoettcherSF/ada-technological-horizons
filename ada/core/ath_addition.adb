with Ada.Unchecked_Conversion;

package body Ath_Addition is
   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      --  An all-ones exponent marks both infinities and NaNs.
      return Exponent /= 16#7FF#;
   end Is_Finite;

   procedure Add
     (Left   : Long_Float;
      Right  : Long_Float;
      Result : out Long_Float;
      Status : out Status_Code)
   is
      Sum : Long_Float;
   begin
      Result := 0.0;
      if not Is_Finite (Left) or else not Is_Finite (Right) then
         Status := Non_Finite_Input;
         return;
      end if;

      Sum := Left + Right;
      if not Is_Finite (Sum) then
         Status := Result_Not_Finite;
         return;
      end if;

      Result := Sum;
      Status := Ok;
   end Add;
end Ath_Addition;

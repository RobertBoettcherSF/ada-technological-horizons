with Interfaces;

--  Finite binary64 addition.
--
--  Long_Float must be IEEE-754 binary64 on every toolchain used here.
--  Ada validates the operands and the sum. Callers pass canonical numeric
--  values; an empty text field is not a binary64 value and is rejected by
--  the marshalling layer before this package is called.
--
--  Contract:
--  * Both operands must be finite. A negative finite operand is an ordinary
--    value, not an error.
--  * The sum must be finite. A result of ±infinity is Result_Not_Finite.
--  * Underflow to a finite result, including signed zero, is success.
--  * On any error, Result is 0.0 and must not be presented as the sum.
package Ath_Addition is
   pragma Compile_Time_Error
     (Long_Float'Size /= 64,
      "Ath_Addition requires a binary64 Long_Float");

   subtype Status_Code is Interfaces.Integer_32;

   Ok               : constant Status_Code := 0;
   Non_Finite_Input : constant Status_Code := 1;
   Result_Not_Finite : constant Status_Code := 2;

   procedure Add
     (Left   : Long_Float;
      Right  : Long_Float;
      Result : out Long_Float;
      Status : out Status_Code);
end Ath_Addition;

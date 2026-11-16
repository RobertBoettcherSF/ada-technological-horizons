with Interfaces;

--  Fixed-width export boundary. JavaScript may pass two binary64 values and
--  read a 32-bit status. The numeric result is available only when the status
--  is Ok; otherwise Ath_Last_Sum is cleared to 0.0 and must not be rendered.
package Ath_Addition_Exports is
   function Ath_Add_F64
     (Left, Right : Long_Float) return Interfaces.Integer_32
   with Export, Convention => C, External_Name => "ath_add_f64";

   function Ath_Last_Sum return Long_Float
   with Export, Convention => C, External_Name => "ath_last_sum";
end Ath_Addition_Exports;
